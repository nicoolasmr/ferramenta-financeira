
import { createClient } from "@/lib/supabase/server";
import { CanonicalEvent } from "@/lib/contracts/canonical";
import crypto from "crypto";

/**
 * Normalize Event
 * Saves the canonical event to 'external_events_normalized'.
 */
export async function saveCanonicalEvents(rawId: string, events: CanonicalEvent[]) {
    const supabase = await createClient();
    const savedIds: string[] = [];

    for (const event of events) {
        // Generate Dedupe Hash for Canonical Event
        const contentHash = crypto.createHash('sha256')
            .update(JSON.stringify(event.data) + event.provider + event.refs.provider_object_id) // Include unique ref
            .digest('hex');

        const { data, error } = await supabase
            .from('external_events_normalized')
            .insert({
                raw_event_id: rawId,
                org_id: event.org_id,
                project_id: event.project_id,
                provider: event.provider,
                canonical_type: event.domain_type,
                canonical_event: event.data,
                event_refs: event.refs, // DB col: event_refs, TS prop: refs
                occurred_at: event.occurred_at,
                normalized_hash: contentHash
            })
            .select('id')
            .single();

        if (error) {
            if (error.code === '23505') {
                // Already exists, fetch ID
                const { data: existing } = await supabase
                    .from('external_events_normalized')
                    .select('id')
                    .eq('org_id', event.org_id) // RLS requires this?
                    .eq('provider', event.provider) // optimize query
                    .eq('normalized_hash', contentHash)
                    .single();
                if (existing) savedIds.push(existing.id);
                continue;
            }
            throw error;
        }
        savedIds.push(data.id);
    }

    // Update raw status
    await supabase.from('external_events_raw').update({
        status: 'processed',
        processed_at: new Date().toISOString()
    }).eq('id', rawId);

    return savedIds;
}
