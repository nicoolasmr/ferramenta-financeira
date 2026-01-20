"use server";

import { createClient } from "@/lib/supabase/server";
import { ImportRow } from "@/lib/import/mapping";
import { generateInstallments } from "@/lib/scheduling/engine";
import { revalidatePath } from "next/cache";

export async function processBulkImport(rows: ImportRow[], orgId: string, projectId: string) {
    const supabase = await createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("Unauthorized");

    let processed = 0;
    let failed = 0;

    // TODO in V2: Use proper bulk insert (SQL function) for atomicity
    // Current MVP: Loop and await (slower but safer logic reuse)

    for (const row of rows) {
        try {
            // 1. Customer
            let customerId: string;
            const { data: existing } = await supabase.from("customers")
                .select("id").eq("org_id", orgId).eq("name", row.name).single(); // Simple name match fallback

            if (existing) {
                customerId = existing.id;
            } else {
                const { data: newC } = await supabase.from("customers").insert({
                    org_id: orgId,
                    name: row.name,
                    email: row.email || null
                }).select("id").single();

                if (!newC) throw new Error("Failed cust");
                customerId = newC.id;
            }

            // 2. Enrollment
            const { data: enroll } = await supabase.from("enrollments").insert({
                org_id: orgId,
                project_id: projectId,
                customer_id: customerId,
                status: "active",
                cycle_start_date: new Date().toISOString().split('T')[0]
            }).select("id").single();

            if (!enroll) throw new Error("Failed enroll");

            // 3. Plan
            const amountCents = Math.round(row.total_amount * 100);
            const { data: plan } = await supabase.from("payment_plans").insert({
                org_id: orgId,
                enrollment_id: enroll.id,
                total_amount_cents: amountCents,
                currency: "BRL",
                installments_count: row.installments
            }).select("id").single();

            if (!plan) throw new Error("Failed plan");

            // 4. Installments
            const installments = generateInstallments({
                planId: plan.id,
                totalAmountCents: amountCents,
                installmentsCount: row.installments,
                intervalMonths: 1,
                firstDueDate: new Date().toISOString().split('T')[0],
                ruleType: "manual_start"
            });

            await supabase.from("installments").insert(installments.map(i => ({ ...i, org_id: orgId })));

            processed++;
        } catch (e) {
            console.error(e);
            failed++;
        }
    }

    await supabase.from("audit_logs").insert({
        org_id: orgId,
        entity: "bulk_import",
        entity_id: "batch",
        action: "bulk_import_enrollments",
        details: JSON.stringify({ processed, failed, total: rows.length }),
        actor_id: user.id
    });

    revalidatePath("/app/enrollments");
    return { success: true, processed, failed };
}
