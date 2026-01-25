
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/security/encryption";

export async function getProjectSecrets(projectId: string, provider: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_secrets')
        .select('secrets, encrypted')
        .eq('project_id', projectId)
        .eq('provider', provider)
        .single();

    if (error || !data) return null;

    // Check if encrypted flag is present (Migration strategy)
    if (data.encrypted) {
        try {
            const masterKey = process.env.ENCRYPTION_KEY;
            if (!masterKey) throw new Error("ENCRYPTION_KEY not set");

            // Decrypt fields
            // Assuming data.secrets is JSON string if encrypted? Or object with encrypted values?
            // Let's assume the whole 'secrets' JSON column is ONE encrypted string?
            // Or 'secrets' is JSONB, and values are encrypted strings?
            // "secrets": { "api_key": "enc:..." }

            // Implementation: We assume 'secrets' is JSONB.
            // We iterate keys and decrypt if value starts with 'enc:'. (Or we explicitly track encryption).
            // But strict encryption:
            // "encrypted": true usually implies the row is treated as encrypted content.

            // Let's try to parse
            const decrypted: any = {};
            for (const [key, value] of Object.entries(data.secrets)) {
                if (typeof value === 'string') {
                    decrypted[key] = decrypt(value, masterKey);
                } else {
                    decrypted[key] = value;
                }
            }
            return decrypted;
        } catch (e) {
            console.error("Failed to decrypt secrets:", e);
            throw e;
        }
    }

    // Fallback: Return raw secrets (Legacy)
    return data.secrets;
}

export async function saveProjectSecrets(projectId: string, provider: string, secrets: Record<string, string>) {
    const masterKey = process.env.ENCRYPTION_KEY;
    if (!masterKey) throw new Error("ENCRYPTION_KEY not set");

    const encryptedSecrets: Record<string, string> = {};
    for (const [key, value] of Object.entries(secrets)) {
        encryptedSecrets[key] = encrypt(value, masterKey);
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('project_secrets')
        .upsert({
            project_id: projectId,
            provider: provider,
            secrets: encryptedSecrets,
            encrypted: true,
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id, provider' }); // Check constraint

    if (error) throw error;
}
