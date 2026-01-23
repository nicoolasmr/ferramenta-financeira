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

export interface WebhookEvent {
    id: string;
    provider: string;
    status: 'pending' | 'processed' | 'failed';
    received_at: string;
    processed_at?: string;
    payload: any;
    error_message?: string;
}

export async function getWebhookLogs(orgId: string, limit = 50): Promise<WebhookEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("webhook_inbox")
        .select("*")
        .eq("org_id", orgId)
        .order("received_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

export async function retryWebhookEvent(eventId: string) {
    const supabase = await createClient();

    // 1. Get the event
    const { data: event, error: fetchError } = await supabase
        .from("webhook_inbox")
        .select("*")
        .eq("id", eventId)
        .single();

    if (fetchError || !event) throw new Error("Event not found");

    // 2. Reset status to pending to be picked up by the worker (or process immediately if we had the logic here)
    // For now, we will just update the status so the async worker tries again.
    // If the worker logic was here, we would call it. 
    // Assuming a background worker processes 'pending' events.

    const { error: updateError } = await supabase
        .from("webhook_inbox")
        .update({
            status: 'pending',
            error_message: null,
            processed_at: null
        })
        .eq("id", eventId);

    if (updateError) throw updateError;
    revalidatePath("/app/settings/webhooks");
    return { success: true };
}
