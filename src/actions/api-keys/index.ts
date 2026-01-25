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

    // Mask keys for display
    return data?.map((k: APIKey) => ({
        ...k,
        key: k.key.substring(0, 6) + "..." + k.key.substring(k.key.length - 4) // Show prefix + suffix only (if hash, this will show hash parts, but better than raw if we stored raw. If we store hash, we can't show real key anyway.)
        // Actually, if we store Hash, we can't show "sk_..." prefix unless we store it separately.
        // For MVP/Audit fix, let's assume we store "sk_hash..." or just hash.
        // Ideally we store `key_hash` and `key_prefix`.
        // Let's just Mask it here assuming current data is raw, and new data will be hashed.
        // If it's hashed, it looks like random chars. 
    })) || [];
}

export async function createAPIKey(formData: {
    name: string;
    org_id: string;
}) {
    const supabase = await createClient();

    // Generate secure API key
    const rawKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { data, error } = await supabase
        .from("api_keys")
        .insert({
            ...formData,
            key: hashedKey, // Store HASH
            status: "active",
        })
        .select()
        .single();

    if (error) throw error;
    revalidatePath("/app/settings/api-keys");

    return { key: rawKey }; // Return RAW key once
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
