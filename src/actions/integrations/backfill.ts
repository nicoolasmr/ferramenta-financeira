"use server";

import { createClient } from "@/lib/supabase/server";
import { getConnector } from "@/connectors/registry";
import { getProjectSecrets } from "@/lib/integrations/secrets";
import { enqueueJob } from "@/lib/queue/enqueue";

interface BackfillOptions {
    startFrom?: Date;
    projectId: string;
    provider: string;
}

export async function triggerBackfillAction(options: BackfillOptions) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Validate Project Ownership
    const { data: project } = await supabase.from('projects')
        .select('org_id')
        .eq('id', options.projectId)
        .single();

    if (!project) throw new Error("Project not found");

    // Check membership
    const { data: member } = await supabase.from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('org_id', project.org_id)
        .single();

    if (!member) throw new Error("Unauthorized access to project");

    // 2. Get Connector
    const connector = await getConnector(options.provider);
    if (!connector) throw new Error(`Connector ${options.provider} not found`);

    if (!connector.capabilities.backfill) {
        throw new Error(`Provider ${options.provider} does not support backfill`);
    }

    // 3. Enqueue Sync Job
    // We enqueue a job that the worker will pick up. 
    // The worker will then call `connector.triggerBackfill`.
    // This ensures long-running backfills don't timeout the server action.

    const jobId = await enqueueJob(project.org_id, 'sync_provider', {
        provider: options.provider,
        start_from: options.startFrom?.toISOString()
    }, options.projectId);

    return { success: true, jobId };
}
