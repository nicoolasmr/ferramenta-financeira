"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GatewayProvider = 'stripe' | 'hotmart' | 'asaas' | 'eduzz' | 'kiwify' | 'mercadopago';

export interface GatewayIntegration {
    id: string;
    project_id: string;
    provider: GatewayProvider;
    credentials: Record<string, any>;
    webhook_secret?: string;
    is_active: boolean;
    last_sync_at?: string;
    sync_status?: string;
    created_at: string;
    updated_at: string;
}

export async function getIntegrations(projectId: string): Promise<GatewayIntegration[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("gateway_integrations")
        .select("*")
        .eq("project_id", projectId);

    if (error) {
        console.error("Error fetching integrations:", error);
        return [];
    }

    return data || [];
}

export async function connectIntegration(formData: {
    projectId: string;
    provider: GatewayProvider;
    credentials: Record<string, any>;
}) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("gateway_integrations")
        .upsert({
            project_id: formData.projectId,
            provider: formData.provider,
            credentials: formData.credentials,
            is_active: true,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'project_id,provider'
        });

    if (error) {
        console.error("Error connecting integration:", error);
        throw new Error("Failed to connect integration");
    }

    revalidatePath("/app/integrations");
}

export async function disconnectIntegration(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("gateway_integrations")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error disconnecting integration:", error);
        throw new Error("Failed to disconnect integration");
    }

    revalidatePath("/app/integrations");
}

export async function toggleIntegration(id: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("gateway_integrations")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) {
        console.error("Error toggling integration:", error);
        throw new Error("Failed to toggle integration");
    }

    revalidatePath("/app/integrations");
}
