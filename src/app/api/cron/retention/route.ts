
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { requireInternalAuth } from "@/lib/security/internalAuth";

export async function POST(req: NextRequest) {
    const authError = requireInternalAuth(req);
    if (authError) return authError;

    const supabase = await createClient();

    // Retention Rules (Hardcoded for MVP, ideally from Config)
    const RETENTION_DAYS = 30;

    // We assume there's a table `provider_events_raw` (implied) or we clean `jobs_queue`?
    // Based on previous prompts, we might not have explicitly created `provider_events_raw`.
    // We heavily use `jobs_queue` payload for raw storage in the "Stabilization Pack".
    // So let's clean up completed/dead jobs older than X days.

    // Cleanup Jobs Queue
    const { error: jobError, count: jobCount } = await supabase
        .from('jobs_queue')
        .delete({ count: 'exact' })
        .in('status', ['completed', 'dead'])
        .lt('created_at', new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString());

    if (jobError) {
        console.error("Retention Cleanup Failed:", jobError);
        return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `Cleaned jobs older than ${RETENTION_DAYS} days`,
        deleted_count: jobCount
    });
}
