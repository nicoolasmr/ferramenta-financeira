"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface APIKey {
    id: string;
    name: string;
    key: string;
    org_id: string;
    created_at: string;
    last_used_at?: string;
    status: "active" | "revoked";
}

export async function getAPIKeys(orgId: string): Promise<APIKey[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createAPIKey(formData: {
    name: string;
    org_id: string;
}) {
    const supabase = await createClient();

    // Generate secure API key
    const key = `sk_${crypto.randomBytes(32).toString("hex")}`;

    const { data, error } = await supabase
        .from("api_keys")
        .insert({
            ...formData,
            key,
            status: "active",
        })
        .select()
        .single();

    if (error) throw error;
    revalidatePath("/app/settings/api-keys");

    return { key }; // Return the key only once
}

export async function revokeAPIKey(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("api_keys")
        .update({ status: "revoked" })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/app/settings/api-keys");
}

export async function deleteAPIKey(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("api_keys").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/app/settings/api-keys");
}
