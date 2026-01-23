"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const onboardingSchema = z.object({
    orgName: z.string().min(3),
    orgSlug: z.string().min(3), // TODO: regex validation
    projectName: z.string().min(3),
    planCode: z.enum(["starter", "pro", "agency"]),
    integration: z.string().optional(),
});

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const data = {
        orgName: formData.get("orgName") as string,
        orgSlug: formData.get("orgSlug") as string,
        projectName: formData.get("projectName") as string,
        planCode: formData.get("planCode") as string || "starter",
        integration: formData.get("integration") as string,
    };

    const validation = onboardingSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    // 1. Create Organization
    const { data: org, error: orgError } = await supabase.from("organizations").insert({
        name: data.orgName,
        slug: data.orgSlug,
        // owner_id logic usually via RLS/Trigger or explicit membership creation next
    }).select("id").single();

    if (orgError) {
        return { error: { server: orgError.message } };
    }

    // 2. Create Membership (Owner)
    await supabase.from("memberships").insert({
        org_id: org.id,
        user_id: user.id,
        role: "owner"
    });

    // 3. Create Settings
    await supabase.from("settings").insert({
        org_id: org.id,
        currency: "BRL",
        timezone: "America/Sao_Paulo"
    });

    // 4. Create First Project
    await supabase.from("projects").insert({
        org_id: org.id,
        name: data.projectName
    });

    // 5. Billing Setup (Mock for now, real implementation would create Stripe Customer here)
    // Fetch plan ID
    const { data: plan } = await supabase.from("plans").select("id").eq("code", data.planCode).single();

    if (plan) {
        await supabase.from("subscriptions").insert({
            org_id: org.id,
            plan_id: plan.id,
            status: "active", // trial or active
            provider: "stripe"
        });
    }

    // 6. Create Integration (if selected)
    if (data.integration && data.integration !== 'skip') {
        // Map integration to provider key (lowercase)
        const provider = data.integration.toLowerCase();
        await supabase.from("gateway_integrations").insert({
            org_id: org.id,
            provider: provider,
            name: data.integration,
            status: "active", // mock active for onboarding
            credentials: {} // empty credentials for now
        });
    }

    redirect(`/app?org=${org.id}`);
}
