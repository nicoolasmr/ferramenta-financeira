"use server";

import { createClient } from "@/lib/supabase/server";
import { saveProjectSecrets as saveSecretsHelper } from "@/lib/integrations/secrets";

export async function saveProjectSecrets(projectId: string, provider: string, secrets: Record<string, string>) {
    const supabase = await createClient();

    // 1. Check Permissions
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error("Unauthorized");
    }

    // 2. Save Secrets (Encrypted via Helper)
    try {
        await saveSecretsHelper(projectId, provider, secrets);
    } catch (error) {
        console.error("Failed to save secrets", error);
        throw new Error("Failed to save configuration");
    }

    return { success: true };
}
