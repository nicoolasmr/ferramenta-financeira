
import { NextRequest, NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/queue/worker";

import { requireInternalAuth } from "@/lib/security/internalAuth";

export async function POST(req: NextRequest) {
    // Auth Check (CRON_SECRET)
    const authError = requireInternalAuth(req);
    if (authError) return authError;

    try {
        const result = await processPendingJobs();
        return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
        console.error("Worker Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
