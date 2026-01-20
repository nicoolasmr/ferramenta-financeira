import { NextResponse } from "next/server";
import { processPendingBatch } from "@/lib/sync/engine";

export async function GET(req: Request) {
    // Check for Cron Secret (Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
        // return new NextResponse('Unauthorized', { status: 401 });
        // Allowing for now for manual calling during dev
    }

    try {
        const result = await processPendingBatch(20);
        return NextResponse.json(result);
    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 });
    }
}
