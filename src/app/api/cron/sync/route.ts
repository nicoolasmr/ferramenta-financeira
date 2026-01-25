import { NextRequest, NextResponse } from "next/server";
import { processPendingBatch } from "@/lib/sync/engine";
import { requireInternalAuth } from "@/lib/security/internalAuth";

export async function GET(req: NextRequest) {
    // Check for Cron Secret (Vercel Cron)
    const authError = requireInternalAuth(req);
    if (authError) return authError;

    try {
        const result = await processPendingBatch(20);
        return NextResponse.json(result);
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
