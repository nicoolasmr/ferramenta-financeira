"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification, NotificationType } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function getNotifications(orgId: string): Promise<Notification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    return data || [];
}

export async function markAsRead(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/app");
}

export async function markAllAsRead(orgId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("org_id", orgId)
        .is("read_at", null);

    if (error) throw error;
    revalidatePath("/app");
}

export async function createNotification(data: {
    org_id: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    user_id?: string;
}) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("notifications")
        .insert([{
            ...data,
            type: data.type || "info"
        }]);

    if (error) throw error;
    revalidatePath("/app");
}
