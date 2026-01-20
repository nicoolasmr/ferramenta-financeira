import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This is a "catch-all" dynamic route for /api/webhooks/[provider]
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ provider: string }> }
) {
    const params = await props.params;
    const provider = params.provider;
    const signature = request.headers.get("x-signature") ||
        request.headers.get("stripe-signature") ||
        request.headers.get("x-hotmart-hottok") || "";

    const payload = await request.text(); // Get raw body for verification if needed

    // 1. Log Event (Atomic Log)
    const supabase = await createClient();

    console.log(`[Webhook] Received for ${provider}`, { signature: signature?.substring(0, 10) + "..." });

    // Mock Processing Logic
    let status = "processed";
    let error = null;

    try {
        const json = JSON.parse(payload);
        // Dispatch to specific provider handler
        // await handleProviderEvent(provider, json);
    } catch (e: any) {
        status = "failed";
        error = e.message;
    }

    return NextResponse.json({ received: true, status });
}
