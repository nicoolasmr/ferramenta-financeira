"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Webhook {
    id: string;
    url: string;
    events: string[];
    status: "active" | "inactive";
    secret: string;
    org_id: string;
    created_at: string;
    last_delivery_at?: string;
    success_rate: number;
}

export async function getWebhooks(orgId: string): Promise<Webhook[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("webhook_endpoints")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createWebhook(formData: {
    url: string;
    events: string[];
    org_id: string;
}) {
    const supabase = await createClient();

    // Generate secret
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const { error } = await supabase.from("webhook_endpoints").insert({
        ...formData,
        secret,
        status: "active",
        success_rate: 100,
    });

    if (error) throw error;
    revalidatePath("/app/settings/webhooks");
}

export async function updateWebhook(id: string, formData: Partial<Webhook>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("webhook_endpoints")
        .update(formData)
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/app/settings/webhooks");
}

export async function deleteWebhook(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("webhook_endpoints").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/app/settings/webhooks");
}

export async function testWebhook(id: string) {
    const supabase = await createClient();
    const { data: webhook } = await supabase
        .from("webhook_endpoints")
        .select("*")
        .eq("id", id)
        .single();

    if (!webhook) throw new Error("Webhook not found");

    // Send test payload
    try {
        const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Webhook-Secret": webhook.secret,
            },
            body: JSON.stringify({
                event: "test",
                data: { message: "This is a test webhook" },
                timestamp: new Date().toISOString(),
            }),
        });

        return { success: response.ok, status: response.status };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
