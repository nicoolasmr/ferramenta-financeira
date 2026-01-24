
import { createClient } from "@/lib/supabase/server";
import { getConnector } from "@/connectors/registry";
import { NormalizedEvent } from "@/lib/integrations/sdk";

/**
 * Worker Logic Hardened (V2)
 */
export async function processPendingJobs() {
    const supabase = await createClient();

    // 1. Safe Poll via RPC
    const { data: jobs, error } = await supabase.rpc('fetch_next_jobs', { p_limit: 5 });
    if (error || !jobs || jobs.length === 0) return { processed: 0 };

    let processedCount = 0;

    for (const job of (jobs as any[])) {
        try {
            console.log(`Processing Job ${job.id} (${job.job_type})`);

            // EXECUTE Logic
            switch (job.job_type) {
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
                        const { data: secretData } = await supabase.from('project_secrets')
                            .select('secrets').eq('project_id', job.project_id).single();
                        if (secretData?.secrets) {
                            await connector.triggerBackfill(job.project_id, secretData.secrets);
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
                // Determine Org ID (it's in job usually, or we query it, assuming job has org_id column or payload has it)
                // My job structure usually has org_id column or inside payload.
                // Assuming job row has org_id (best practice) OR we take from payload.
                // Let's use payload.org_id since worker fetch logic was generic.
                // Re-reading worker fetch: it returns * from jobs_queue. jobs_queue "usually" has org_id.
                // If not, we use payload.
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
