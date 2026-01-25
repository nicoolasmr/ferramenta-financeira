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
        orgSlug: (formData.get("orgSlug") as string)?.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || "",
        projectName: formData.get("projectName") as string,
        planCode: formData.get("planCode") as string || "starter",
        integration: formData.get("integration") as string,
    };

    const validation = onboardingSchema.safeParse(data);
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors };
    }

    // 1. Create Organization
    console.log("Onboarding: Creating organization", data.orgName);
    const { data: org, error: orgError } = await supabase.from("organizations").insert({
        name: data.orgName,
        slug: data.orgSlug,
    }).select("id").single();

    if (orgError) {
        console.error("Onboarding Error (Organization):", orgError);
        return { error: { server: orgError.message } };
    }

    console.log("Onboarding: Created organization", org.id);

    // 1.5 Ensure User Exists in Public Table
    let adminClient = null;
    let userSyncError = null;

    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey && serviceRoleKey !== 'placeholder-key') {
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
            adminClient = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceRoleKey,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            // Upsert User with Admin
            const { error } = await adminClient.from("users").upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString(),
            }, { onConflict: "id" });
            userSyncError = error;
        } else {
            console.warn("Onboarding: SUPABASE_SERVICE_ROLE_KEY missing, using user client fallback.");
            // Fallback to normal client
            const { error } = await supabase.from("users").upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
                avatar_url: user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString(),
            }, { onConflict: "id" });
            userSyncError = error;
        }
    } catch (e: any) {
        console.error("Onboarding: Admin Client Init Failed:", e);
        // Fallback
        const { error } = await supabase.from("users").upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            avatar_url: user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
        }, { onConflict: "id" });
        userSyncError = error;
    }

    const debugInfo = `ServiceKey: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, AdminClient: ${!!adminClient}`;

    if (userSyncError) {
        console.error("Onboarding Error (User Sync):", userSyncError);
        return { error: { server: `User Profile Sync Failed. ${debugInfo}. DB Error: ${userSyncError.message} (${userSyncError.code})` } };
    }

    // 2. Create Membership (Owner)
    // Use admin client if available to bypass RLS, otherwise user client
    const targetClient = adminClient || supabase;

    const { error: membershipError } = await targetClient.from("memberships").insert({
        org_id: org.id,
        user_id: user.id,
        role: "owner"
    });

    if (membershipError) {
        console.error("Onboarding Error (Membership):", membershipError);
        return { error: { server: `Membership Failed. ${debugInfo}. Error: ${membershipError.message}. Details: ${membershipError.details || 'None'}` } };
    }

    // 3. Create Settings
    await supabase.from("settings").insert({
        org_id: org.id,
        currency: "BRL",
        timezone: "America/Sao_Paulo"
    });

    // 4. Create First Project
    console.log("Onboarding: Creating first project", data.projectName);
    const { data: firstProject, error: projectError } = await supabase.from("projects").insert({
        org_id: org.id,
        name: data.projectName
    }).select("id").single();

    if (projectError || !firstProject) {
        console.error("Onboarding Error (Project):", projectError);
        return { error: { server: projectError?.message || "Failed to create first project" } };
    }

    console.log("Onboarding: Created project", firstProject.id);

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
        const provider = data.integration.toLowerCase();
        await supabase.from("gateway_integrations").insert({
            project_id: firstProject.id,
            provider: provider,
            name: data.integration,
            status: "active",
            credentials: {}
        });
    }

    redirect(`/app?org=${org.id}`);
}
