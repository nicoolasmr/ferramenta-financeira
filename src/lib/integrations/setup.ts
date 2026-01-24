
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getWebhookUrl(projectId: string, provider: string) {
    const supabase = await createClient();

    // 1. Check if key exists
    let { data } = await supabase.from('project_webhook_keys')
        .select('webhook_key')
        .eq('project_id', projectId)
        .eq('provider', provider)
        .single();

    if (!data) {
        // Generate new key
        const crypto = await import('crypto');
        const key = crypto.randomBytes(16).toString('hex');

        // Get Org ID (safe lookup)
        const { data: project } = await supabase.from('projects').select('org_id').eq('id', projectId).single();
        if (!project) throw new Error("Project not found");

        const { data: newKey, error } = await supabase.from('project_webhook_keys')
            .insert({
                project_id: projectId,
                org_id: project.org_id,
                provider,
                webhook_key: key
            })
            .select('webhook_key')
            .single();

        if (error) throw error;
        data = newKey;
    }

    // Construct URL
    // Need BASE_URL from env or request headers. Using default for now.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://revenueos.com";
    return `${baseUrl}/api/webhooks/${provider}?key=${data!.webhook_key}`;
}
