"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

import { onboardingSchema } from "./schema";

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

    // NUCLEAR OPTION: Call the Postgres RPC
    console.log("Onboarding (RPC Mode): Executing create_onboarding_package for", userId);

    const { data: result, error: rpcError } = await adminClient.rpc('create_onboarding_package', {
        p_user_id: userId,
        p_org_name: data.orgName,
        p_org_slug: data.orgSlug,
        p_project_name: data.projectName,
        p_plan_code: data.planCode,
        p_integration: data.integration || null
    });

    if (rpcError) {
        console.error("Onboarding Error (RPC):", rpcError);
        // Clean error message
        const msg = rpcError.message.replace('Onboarding Failed: ', '');
        if (msg.includes('duplicate key')) return { error: { server: "Este URL de workspace já está em uso." } };
        return { error: { server: `Erro no setup: ${msg}` } };
    }

    const payload = result as any; // RPC returns JSONB
    if (!payload || !payload.success) {
        return { error: { server: "Erro desconhecido ao criar organização." } };
    }

    console.log("Onboarding Complete. Redirecting to Org:", payload.org_id);
    redirect(`/app?org=${payload.org_id}`);
}
