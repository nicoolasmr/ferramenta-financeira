"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveIntegrationConfig(provider: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Resolve Org
    const { data: membership } = await supabase.from("memberships").select("org_id").eq("user_id", user.id).single();
    if (!membership) throw new Error("No Org Found");

    const config: Record<string, any> = {};
    // Extract config based on provider
    if (provider === 'stripe') {
        config.account_id = formData.get("account_id");
    } else if (provider === 'hotmart') {
        config.hottok = formData.get("hottok");
    } else if (provider === 'asaas') {
        config.api_key = formData.get("api_key");
    }

    // Simple encryption mock (Real world: use dedicated encryption service or Vault)
    const configEncrypted = Buffer.from(JSON.stringify(config)).toString('base64');

    await supabase.from("integrations").upsert({
        org_id: membership.org_id,
        provider: provider,
        status: "active",
        config_encrypted: configEncrypted,
        updated_at: new Date().toISOString()
    }, { onConflict: 'org_id, provider' });

    revalidatePath(`/app/integrations/${provider}`);
}

export async function getIntegrationLogs(provider: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: membership } = await supabase.from("memberships").select("org_id").eq("user_id", user.id).single();
    if (!membership) return [];

    const { data: logs } = await supabase
        .from("external_events_raw") // Should use this table from SaaS core
        .select("*")
        .eq("org_id", membership.org_id)
        .eq("provider", provider)
        .order("received_at", { ascending: false })
        .limit(20);

    return logs || [];
}
