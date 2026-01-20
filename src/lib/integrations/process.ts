import { createClient } from "@/lib/supabase/server";
import { getConnector } from "@/connectors/registry";
import { applyEvent } from "@/lib/integrations/applier";

export async function processExternalEvent(orgId: string, provider: string, externalEventId: string) {
    const supabase = await createClient();

    // 1. Fetch Raw Event
    const { data: raw } = await supabase.from("external_events_raw")
        .select("*")
        .eq("org_id", orgId)
        .eq("provider", provider)
        .eq("external_event_id", externalEventId)
        .single();

    if (!raw) throw new Error("Raw event not found");

    // 2. Normalize
    const connector = getConnector(provider);
    if (!connector) throw new Error("Provider not supported");

    let canonicalEvents = [];
    try {
        // We pass empty headers as we might not have original headers stored or needed for normalize logic mostly (except signature)
        // Ideally we should store headers if needed for normalize, but usually body is enough.
        canonicalEvents = connector.normalize(raw.payload_json, new Headers());
    } catch (e: any) {
        throw new Error(`Normalization failed: ${e.message}`);
    }

    // 3. Apply (Idempotent)
    for (const event of canonicalEvents) {
        // We re-insert normalized to ensure it exists (idempotent via raw_id+type constraint)
        // Use upsert with ignoreDuplicates to handle uniqueness constraint without error
        await supabase.from("external_events_normalized").upsert({
            org_id: orgId,
            provider: provider,
            raw_event_id: raw.external_event_id,
            canonical_type: event.canonical_type,
            canonical_payload: event.payload
        }, { onConflict: 'raw_event_id, canonical_type', ignoreDuplicates: true });

        await applyEvent(orgId, event, provider);
    }

    // 4. Update Status
    await supabase.from("external_events_raw")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", raw.id);

    return { success: true, count: canonicalEvents.length };
}
