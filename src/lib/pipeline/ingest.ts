
import { createClient } from "@/lib/supabase/server";
import { RawEvent } from "@/connectors/sdk/types";
import crypto from "crypto";

/**
 * Ingest Raw Event
 * Saves the payload idempotently to 'external_events_raw'.
 */
export async function ingestEvent(raw: RawEvent, orgId: string, projectId?: string) {
    const supabase = await createClient();

    // 1. Generate Idempotency Key
    // Hash(payload + provider + event_type) usually isn't enough if multiple identical events occur.
    // We ideally need the Provider's Event ID.
    // Let's assume parseWebhook extracted it into metadata or we extract it from payload here.
    // For now, we trust the connector to provide enough info in parseWebhook or we hash the payload content.

    // Better strategy: The parsed RawEvent likely missed "external_id". 
    // Let's rely on content hashing for now if ID is missing.
    const payloadStr = JSON.stringify(raw.payload);
    const hash = crypto.createHash('sha256').update(`${raw.provider}:${raw.event_type}:${payloadStr}`).digest('hex');

    // 2. Insert
    const { data, error } = await supabase
        .from('external_events_raw')
        .insert({
            org_id: orgId,
            project_id: projectId,
            provider: raw.provider,
            event_type: raw.event_type,
            payload: raw.payload,
            headers: raw.headers,
            idempotency_key: hash, // For now using content hash
            received_at: new Date().toISOString(),
            status: 'pending'
        })
        .select('id')
        .single();

    if (error) {
        // If conflict (idempotency), we fetch the existing one
        if (error.code === '23505') { // Unique violation
            const { data: existing } = await supabase
                .from('external_events_raw')
                .select('id')
                .eq('idempotency_key', hash)
                .single();
            return { id: existing?.id, isNew: false };
        }
        throw error;
    }

    return { id: data.id, isNew: true };
}
