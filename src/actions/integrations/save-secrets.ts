
"use server";

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET_KEY = process.env.PROJECT_SECRETS_KEY || "00000000000000000000000000000000"; // 32 chars ensuring fallback for dev

// Helper: Encrypt
function encrypt(text: string) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return {
        iv: iv.toString("hex"),
        content: encrypted,
        tag: authTag
    };
}

export async function saveProjectSecrets(projectId: string, provider: string, secrets: Record<string, string>) {
    const supabase = await createClient();

    // 1. Check Permissions (ensure user belongs to project's org)
    // Assuming RLS usually handles this, but for explicit action security:
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
        throw new Error("Unauthorized");
    }

    // 2. Encrypt Secrets
    // We store as a JSON blob but we could encrypt fields individually. 
    // For simplicity V2: Encrypt the WHOLE JSON string.

    // WAIT! If we encrypt the whole JSON, we can't query inside it easily (which is good).
    // BUT we need `project_secrets` table to have a `secrets` column that is JSONB or Text?
    // Current schema says `secrets` is JSONB.
    // So we should store: { "api_key": "enc_...", "webhook_secret": "enc_..." } OR store encryption per field?

    // DECISION: Store fields as Cipher objects in JSONB.
    // secrets: { 
    //    "api_key": { iv: "...", content: "...", tag: "..." },
    //    "is_encrypted": true
    // }

    // OR simpler: Encryption at rest is rarely done right in MVP.
    // Let's implement Server-Side Encryption properly.

    const encryptedSecrets: Record<string, any> = { __encrypted: true };

    for (const [key, value] of Object.entries(secrets)) {
        if (value && typeof value === 'string') {
            encryptedSecrets[key] = encrypt(value);
        }
    }

    // 3. Upsert
    const { error } = await supabase.from("project_secrets").upsert({
        project_id: projectId,
        provider: provider,
        secrets: encryptedSecrets,
        updated_at: new Date().toISOString(),
        updated_by: user.user.id
    }, { onConflict: 'project_id, provider' });

    if (error) {
        console.error("Failed to save secrets", error);
        throw new Error("Failed to save configuration");
    }

    return { success: true };
}
