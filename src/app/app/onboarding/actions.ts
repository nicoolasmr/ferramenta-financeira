"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const onboardingSchema = z.object({
    orgName: z.string().min(3),
    orgSlug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
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

    // NUCLEAR OPTION: Use Admin Client for EVERYTHING to bypass RLS during setup
    // This guarantees we don't hit "Foreign Key" or "Policy" errors if the user context is not yet fully established
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = getAdminClient();

    if (!adminClient) {
        console.error("Onboarding FATAL: Service Role Key missing.");
        return { error: { server: "System Configuration Error: Missing Administrative Privileges (Service Key). Please contact support." } };
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

    if (!user || !user.id) {
        console.error("Onboarding Error: User or User ID missing", user);
        return { error: { server: "Falha na autenticação: ID do usuário não encontrado." } };
    }
    const userId = user.id;

    console.log("Onboarding (Admin Mode): Starting for user", userId);

    // 0. FORCE SYNC USER (Admin)
    // We do this first to ensure FK satisfied
    const { error: userSyncError } = await adminClient.from("users").upsert({
        id: userId,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url,
    }, { onConflict: "id" });

    if (userSyncError) {
        console.error("Onboarding Error (User Sync):", userSyncError);
        return { error: { server: `Failed to initialize user profile: ${userSyncError.message}` } };
    }

    // 1. Create Organization (Admin)
    console.log("Onboarding (Admin Mode): Creating organization", data.orgName);
    const { data: org, error: orgError } = await adminClient.from("organizations").insert({
        name: data.orgName,
        slug: data.orgSlug,
    }).select("id").single();

    if (orgError) {
        console.error("Onboarding Error (Organization):", orgError);
        return { error: { server: orgError.message } };
    }

    // 2. Create Membership (Owner) (Admin)
    console.log("Onboarding (Admin Mode): Creating owner membership for user", userId, "org", org.id);
    const { error: membershipError } = await adminClient.from("memberships").insert({
        org_id: org.id,
        user_id: userId,
        role: "owner"
    });

    if (membershipError) {
        console.error("Onboarding Error (Membership):", membershipError);
        // Clean up org if membership fails (optional, but good practice)
        await adminClient.from("organizations").delete().eq("id", org.id);
        return { error: { server: `Failed to assign ownership: ${membershipError.message}` } };
    }

    // 3. Create Settings (Admin)
    await adminClient.from("settings").insert({
        org_id: org.id,
        currency: "BRL",
        timezone: "America/Sao_Paulo"
    });

    // 4. Create First Project (Admin)
    console.log("Onboarding (Admin Mode): Creating first project", data.projectName);
    const { data: firstProject, error: projectError } = await adminClient.from("projects").insert({
        org_id: org.id,
        name: data.projectName
    }).select("id").single();

    if (projectError || !firstProject) {
        console.error("Onboarding Error (Project):", projectError);
        return { error: { server: projectError?.message || "Failed to create first project" } };
    }

    // 5. Billing Setup (Admin)
    const { data: plan } = await adminClient.from("plans").select("id").eq("code", data.planCode).single();
    if (plan) {
        await adminClient.from("subscriptions").insert({
            org_id: org.id,
            plan_id: plan.id,
            status: "active",
            provider: "stripe"
        });
    }

    // 6. Create Integration (Admin)
    if (data.integration && data.integration !== 'skip') {
        const provider = data.integration.toLowerCase();
        await adminClient.from("gateway_integrations").insert({
            project_id: firstProject.id,
            provider: provider,
            name: data.integration,
            status: "active",
            credentials: {}
        });
    }

    console.log("Onboarding Complete. Redirecting.");
    redirect(`/app?org=${org.id}`);
}
