
import { createServiceClient } from "@/lib/supabase/service";
import { getConnector } from "@/connectors/registry";
import { NormalizedEvent } from "@/lib/integrations/sdk";
import { enqueueJob } from "@/lib/queue/enqueue";
import { getProjectSecrets } from "@/lib/integrations/secrets";

/**
 * Worker Logic Hardened (V2)
 */
export async function processPendingJobs() {
    // Worker runs in background, no user session -> Use Service Client
    const supabase = createServiceClient();

    // 1. Safe Poll via RPC
    const { data: jobs, error } = await supabase.rpc('fetch_next_jobs', { p_limit: 5 });
    if (error || !jobs || jobs.length === 0) return { processed: 0 };

    let processedCount = 0;

    for (const job of (jobs as any[])) {
        try {
            console.log(`Processing Job ${job.id} (${job.job_type})`);

            // EXECUTE Logic
            switch (job.job_type) {
                case 'normalize_event':
                    // 1. Fetch Raw Event
                    const rawId = job.payload.raw_event_id;
                    const { data: rawEvent, error: rawFetchError } = await supabase
                        .from('external_events_raw')
                        .select('*')
                        .eq('id', rawId)
                        .single();

                    if (rawFetchError || !rawEvent) {
                        throw new Error(`Raw event not found: ${rawId}`);
                    }

                    // 2. Load Connector
                    const normalizeConnector = await getConnector(rawEvent.provider);
                    if (!normalizeConnector) {
                        throw new Error(`Connector not found: ${rawEvent.provider}`);
                    }

                    // 3. Normalize (Pure Function)
                    // We construct a context object if needed
                    const normalizedEvents = await normalizeConnector.normalize(
                        {
                            ...rawEvent,
                            payload: rawEvent.payload // Ensure payload matches expected SDK structure
                        },
                        {
                            org_id: rawEvent.org_id,
                            project_id: rawEvent.project_id,
                            trace_id: rawEvent.trace_id || `trace_${rawEvent.id}`
                        }
                    );

                    // 4. Enqueue Apply Jobs
                    for (const evt of normalizedEvents) {
                        await enqueueJob(rawEvent.org_id, 'apply_event', evt, rawEvent.project_id);
                    }

                    // 5. Update Raw Status
                    await supabase.from('external_events_raw')
                        .update({ status: 'processed', processed_at: new Date().toISOString() })
                        .eq('id', rawId);

                    break;

                case 'apply_event':
                    // V2 Logic: 'apply_event' payload can be CanonicalEvent (V1) or NormalizedEvent (V2)
                    // If V2, we use connector.apply()
                    const payload = job.payload;

                    if (payload.canonical_module) {
                        // It IS a V2 Normalized Event
                        const event = payload as NormalizedEvent;
                        const connector = await getConnector(event.provider_key);
                        if (connector) {
                            await connector.apply(event, { org_id: event.org_id, project_id: event.project_id });
                        } else {
                            throw new Error(`Connector not found: ${event.provider_key}`);
                        }
                    } else {
                        // Fallback V1
                        const { applyToDomain } = await import("@/lib/pipeline/apply");
                        await applyToDomain([payload]);
                    }
                    break;

                case 'sync_provider':
                    const provider = job.payload.provider;
                    const connector = await getConnector(provider);

                    if (connector && connector.triggerBackfill) {
                        const secrets = await getProjectSecrets(job.project_id, provider);
                        if (secrets) {
                            await connector.triggerBackfill(job.project_id, secrets);
                        }
                    }
                    break;
            }

            // Mark completed
            await supabase.from('jobs_queue').update({
                status: 'completed',
                updated_at: new Date().toISOString()
            }).eq('id', job.id);

            // BILLING METERING
            if (job.job_type === 'apply_event') {
                const orgId = job.org_id || job.payload.org_id;
                if (orgId) {
                    await supabase.rpc('increment_usage', {
                        p_org_id: orgId,
                        p_metric: 'events_processed',
                        p_amount: 1
                    });
                }
            }

            processedCount++;

        } catch (err: any) {
            console.error(`Job ${job.id} failed:`, err);

            // Retry/DLQ Logic (Simplified copy)
            const currentAttempts = (job.attempts || 0) + 1;
            if (currentAttempts < 3) {
                const backoffMinutes = Math.pow(2, currentAttempts);
                await supabase.from('jobs_queue').update({
                    status: 'queued',
                    attempts: currentAttempts,
                    last_error: err.message,
                    available_at: new Date(Date.now() + backoffMinutes * 60000).toISOString()
                }).eq('id', job.id);
            } else {
                await supabase.from('jobs_queue').update({ status: 'dead', last_error: err.message }).eq('id', job.id);
            }
        }
    }

    return { processed: processedCount };
}
