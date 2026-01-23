import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncBelvoLink } from "@/lib/belvo/sync";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const webhookToken = process.env.BELVO_WEBHOOK_TOKEN;

        // 1. Optional security validation
        if (webhookToken && authHeader !== `Token ${webhookToken}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();
        const supabase = await createClient(); // Service role client might be better for webhooks if RLS blocks, but we check org_id in payload

        // 2. Log event (idempotent RAW storage)
        // Belvo webhook payload contains 'link_id' and 'data' usually.
        // We need the org_id associated with this link_id.
        const linkId = payload.link || payload.link_id;

        if (!linkId) {
            return NextResponse.json({ error: "Missing link_id" }, { status: 400 });
        }

        const { data: connection, error: connError } = await supabase
            .from("bank_connections")
            .select("org_id, project_id")
            .eq("link_id", linkId)
            .single();

        if (connError || !connection) {
            // If link not found, we still log it as unknown for debugging
            console.warn(`Belvo Webhook: Received data for unknown link_id: ${linkId}`);
            return NextResponse.json({ message: "Link not found locally" }, { status: 200 });
        }

        await supabase.from("integration_events").insert({
            org_id: connection.org_id,
            provider: "belvo",
            event_type: "data_sync",
            payload: payload,
            status: "pending"
        });

        // 3. Trigger async sync (Server Actions or direct call for background processing)
        // Note: In a production serverless environment, this should be a queue/background job.
        // For local/demo, we call it directly but don't await the full sync for the 200 response.
        syncBelvoLink(linkId, connection.org_id, connection.project_id).catch(console.error);

        return NextResponse.json({ message: "Received and enqueued for sync" }, { status: 200 });
    } catch (error: any) {
        console.error("Belvo Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
