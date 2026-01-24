
import { createClient } from "@/lib/supabase/server";
import { applyToDomain } from "@/lib/pipeline/apply";
import { CanonicalEvent } from "@/lib/contracts/canonical";

/**
 * Worker Logic
 * Polls for pending jobs and executes them.
 */
export async function processPendingJobs() {
    const supabase = await createClient();

    // 1. Poll / Lock
    // We update status to 'running' for tasks available now.
    // This is a simplistic locking mechanism (SKIP LOCKED is better but requires raw SQL).
    // For MVP/Supabase, we can select first then update, optimistic concurrency.

    const { data: jobs, error } = await supabase
        .from('jobs_queue')
        .select('*')
        .in('status', ['queued'])
        .lte('available_at', new Date().toISOString())
        .order('available_at', { ascending: true })
        .limit(5); // Batch size

    if (error) throw error;
    if (!jobs || jobs.length === 0) return { processed: 0 };

    let processedCount = 0;

    for (const job of jobs) {
        // Mark running
        await supabase.from('jobs_queue').update({ status: 'running', updated_at: new Date().toISOString() }).eq('id', job.id);

        try {
            // EXECUTE Logic based on Type
            switch (job.job_type) {
                case 'apply_event':
                    const event = job.payload as CanonicalEvent;
                    await applyToDomain([event]);
                    break;
                case 'sync_provider':
                    // await syncProviderRoutine(job.org_id, job.payload.provider);
                    break;
                default:
                    console.warn(`Unknown job type: ${job.job_type}`);
            }

            // Mark completed
            await supabase.from('jobs_queue').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', job.id);
            processedCount++;

        } catch (err: any) {
            console.error(`Job ${job.id} failed:`, err);

            // Retry Logic
            if (job.attempts < job.max_attempts) {
                const backoffMinutes = Math.pow(2, job.attempts); // 1, 2, 4, 8...
                const nextRun = new Date(Date.now() + backoffMinutes * 60000).toISOString();

                await supabase.from('jobs_queue').update({
                    status: 'queued', // Re-queue
                    attempts: job.attempts + 1,
                    last_error: err.message,
                    available_at: nextRun,
                    updated_at: new Date().toISOString()
                }).eq('id', job.id);
            } else {
                // DLQ (Dead)
                await supabase.from('jobs_queue').update({
                    status: 'dead',
                    last_error: err.message,
                    updated_at: new Date().toISOString()
                }).eq('id', job.id);
            }
        }
    }

    return { processed: processedCount };
}
