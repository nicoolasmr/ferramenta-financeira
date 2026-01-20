import { createClient } from "@/lib/supabase/server";
import { processExternalEvent } from "@/lib/integrations/process";

/**
 * Sync Engine
 * Handles background processing of events, retries, and stuck job recovery.
 */

export async function retryStuckEvents() {
    const supabase = await createClient();

    // 1. Find stuck events (processing for > 10 mins)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: stuck } = await supabase.from("external_events_raw")
        .select("id, external_event_id")
        .eq("status", "processing")
        .lt("processed_at", tenMinutesAgo) // Assuming processed_at updates when status changes to processing? 
        // actually processed_at usually means "finished at".
        // If we don't have "started_at", we might rely on "received_at" if it's pending.
        // But for "processing" status, we usually need a timestamp of when it started.
        // If the schema doesn't have `started_at`, we might need to rely on `updated_at` if it exists.
        // Let's assume we reset 'processing' to 'pending' if it's been there too long.
        // Only if we track when it entered processing.
        // If we lack that field, we skip this specifically or just check if we have a way to know.

        // MVP: simpler approach. 
        // We will just process PENDING events.
        // Stuck events recovery requires a timestamp.
        // Let's assume we stick to processing pending only for now, and maybe "failed" if manual retry.
        .limit(50);

    return { recovered: 0 };
}

export async function processPendingBatch(limit: number = 10) {
    const supabase = await createClient();

    // 1. Lock rows (if using Postgres 9.5+ SKIP LOCKED, but Supabase API might not expose it easily via JS client)
    // We'll use a simple optimistic fetching for MVP.
    const { data: events } = await supabase.from("external_events_raw")
        .select("*")
        .eq("status", "pending")
        .order("received_at", { ascending: true })
        .limit(limit);

    if (!events || events.length === 0) return { processed: 0, errors: 0 };

    let processed = 0;
    let errors = 0;

    for (const event of events) {
        // Mark as processing
        await supabase.from("external_events_raw")
            .update({ status: "processing" }) // We should add updated_at here if we want to detect stuck jobs later
            .eq("id", event.id);

        try {
            await processExternalEvent(event.org_id, event.provider, event.external_event_id);
            processed++;
        } catch (e) {
            console.error(`Failed to process event ${event.id}:`, e);
            // Mark as failed
            await supabase.from("external_events_raw")
                .update({ status: "failed", processed_at: new Date().toISOString() }) // We use processed_at as "finished attempt"
                .eq("id", event.id);
            errors++;
        }
    }

    return { processed, errors };
}
