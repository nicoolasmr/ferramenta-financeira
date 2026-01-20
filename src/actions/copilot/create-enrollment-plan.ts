"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateInstallments } from "@/lib/scheduling/engine";
import { AIEnrollmentSchema } from "@/lib/ai/schemas";

export async function createEnrollmentPlan(data: any, orgId: string) {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("Unauthorized");

    // 1. Zod Validation
    const parsed = AIEnrollmentSchema.safeParse(data);
    if (!parsed.success) {
        throw new Error("Invalid enrollment data: " + JSON.stringify(parsed.error.format()));
    }

    const { customer, plan, project_id, niche } = parsed.data;

    // 2. Fetch or Create Customer
    // Simple heuristic: match by email OR name (MVP)
    let customerId: string;

    const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("org_id", orgId)
        .or(`email.eq.${customer.email || ''},name.eq.${customer.name}`)
        .limit(1)
        .single();

    if (existingCustomer) {
        customerId = existingCustomer.id;
    } else {
        const { data: newCust, error: custError } = await supabase
            .from("customers")
            .insert({
                org_id: orgId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            })
            .select("id")
            .single();

        if (custError) throw new Error("Failed to create customer");
        customerId = newCust.id;
    }

    // 3. Create Enrollment
    // If project_id is missing, default to first active project or throw (MVP: require project_id in UI or hardcode first found)
    let finalProjectId = project_id;
    if (!finalProjectId) {
        const { data: proj } = await supabase.from("projects").select("id").eq("org_id", orgId).limit(1).single();
        if (!proj) throw new Error("No existing project found.");
        finalProjectId = proj.id;
    }

    const { data: enrollment, error: enrollError } = await supabase
        .from("enrollments")
        .insert({
            org_id: orgId,
            project_id: finalProjectId,
            customer_id: customerId,
            niche: niche || "General",
            status: "active",
            cycle_start_date: new Date().toISOString().split('T')[0],
        })
        .select("id")
        .single();

    if (enrollError) throw new Error("Failed to create enrollment");

    // 4. Create Plan
    const { data: paymentPlan, error: planError } = await supabase
        .from("payment_plans")
        .insert({
            org_id: orgId,
            enrollment_id: enrollment.id,
            total_amount_cents: plan.total_amount * 100, // Convert to cents (input is BRL unit)
            currency: "BRL",
            installments_count: plan.installments_count,
            billing_period: "monthly",
            auto_renew: false
        })
        .select("id")
        .single();

    if (planError) throw new Error("Failed to create plan");

    // 5. Generate & Insert Installments
    const installments = generateInstallments({
        planId: paymentPlan.id,
        totalAmountCents: plan.total_amount * 100,
        installmentsCount: plan.installments_count,
        intervalMonths: plan.interval_months,
        firstDueDate: plan.first_due_date || new Date().toISOString().split('T')[0],
        ruleType: "manual_start",
        dayOfMonth: plan.day_of_month
    });

    const { error: instError } = await supabase
        .from("installments")
        .insert(installments.map(i => ({ ...i, org_id: orgId })));

    if (instError) throw new Error("Failed to generate installments");

    // 6. Audit Log
    await supabase.from("audit_logs").insert({
        org_id: orgId,
        entity: "enrollment",
        entity_id: enrollment.id,
        action: "create_enrollment_plan",
        details: JSON.stringify({ source: "ai_chat", data }),
        actor_id: user.id
    });

    revalidatePath("/app/enrollments");
    return { success: true, enrollmentId: enrollment.id };
}
