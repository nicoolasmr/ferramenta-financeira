"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GatewayIntegration = {
    id: string;
    project_id: string;
    provider: string;
    is_active: boolean;
    last_sync_at?: string;
    created_at: string;
    credentials?: any; // We shouldn't send this to client usually, or mask it
};

// Fetch integrations for the current user/org
export async function getIntegrations(orgId: string): Promise<GatewayIntegration[]> {
    const supabase = await createClient();

    // First find projects for this org that the user has access to
    // We strictly filter by orgId and ensure user membership via RLS/Query

    // Actually, RLS on 'gateway_integrations' joins with 'projects' -> 'memberships'
    // So we can just select all where project.org_id = orgId

    const { data, error } = await supabase
        .from('gateway_integrations')
        .select(`
            *,
            projects!inner (
                org_id
            )
        `)
        .eq('projects.org_id', orgId);

    if (error) {
        console.error("Error fetching integrations:", error);
        return [];
    }

    return data as GatewayIntegration[];
}

export async function saveIntegrationConfig(orgId: string, providerId: string, formData: Record<string, string>) {
    const supabase = await createClient();

    // 1. Find the project for this org. For now, we pick the first project found.
    // In the future, we might pass projectId explicitly if we support multiple projects.
    const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('org_id', orgId)
        .limit(1);

    if (projectError || !projects || projects.length === 0) {
        throw new Error("Nenhum projeto encontrado para esta organização.");
    }

    const projectId = projects[0].id;

    // 2. Encrypt/Format credentials
    // Note: In a real app we would encrypt these secrets before storing.
    // For now we store as JSONB.

    const credentials = { ...formData }; // Store all form fields

    // 3. Upsert integration
    const { error } = await supabase
        .from('gateway_integrations')
        .upsert({
            project_id: projectId,
            provider: providerId,
            credentials,
            is_active: true,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'project_id, provider'
        });

    if (error) {
        console.error("Error saving integration:", error);
        throw new Error("Falha ao salvar integração");
    }

    revalidatePath('/app/integrations');
    return { success: true };
}

export async function toggleIntegration(integrationId: string, isActive: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('gateway_integrations')
        .update({ is_active: isActive })
        .eq('id', integrationId);

    if (error) {
        throw error;
    }

    revalidatePath('/app/integrations');
    return { success: true };
}

export async function disconnectIntegration(integrationId: string) {
    // Usually we might just deactivate, but here we can delete
    const supabase = await createClient();

    const { error } = await supabase
        .from('gateway_integrations')
        .delete()
        .eq('id', integrationId);

    if (error) throw error;

    revalidatePath('/app/integrations');
}
