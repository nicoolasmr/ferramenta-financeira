
import { createClient } from "@/lib/supabase/server";

export type JobType = 'sync_provider' | 'apply_event' | 'consistency_run' | 'copilot_run';

export interface JobPayload {
    [key: string]: any;
}

/**
 * Enqueues a job for background processing.
 */
export async function enqueueJob(
    orgId: string,
    type: JobType,
    payload: JobPayload,
    projectId?: string
) {
    const supabase = await createClient();

    // We assume RLS or service role handles this. 
    // Since this is usually called from Server Actions (User Context) or Webhooks (Service Context),
    // we need to be careful. Ideally we write with a service role client if from webhook.
    // For now, using standard client.

    const { data, error } = await supabase.from('jobs_queue').insert({
        org_id: orgId,
        project_id: projectId,
        job_type: type,
        payload: payload,
        status: 'queued'
    }).select().single();

    if (error) {
        console.error("Failed to enqueue job:", error);
        throw error;
    }

    return data;
}
