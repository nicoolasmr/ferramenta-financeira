
import { NextRequest, NextResponse } from "next/server";
import { processPendingJobs } from "@/lib/queue/worker";

export async function POST(req: NextRequest) {
    // Auth Check (CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const result = await processPendingJobs();
        return NextResponse.json({ success: true, ...result });
    } catch (err: any) {
        console.error("Worker Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
