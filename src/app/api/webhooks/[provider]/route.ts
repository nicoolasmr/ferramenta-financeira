import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueJob } from "@/lib/queue/enqueue";
import { getConnector } from "@/connectors/registry";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";
import { ingestEvent } from "@/lib/pipeline/ingest";
import { getProjectSecrets } from "@/lib/integrations/secrets";

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;
    const searchParams = req.nextUrl.searchParams;
    const webhookKey = searchParams.get("key");

    if (!webhookKey) {
        return NextResponse.json({ error: "Missing webhook key" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Resolve Project via Key
    const { data: route, error } = await supabase
        .from('project_webhook_keys')
        .select('project_id, org_id')
        .eq('webhook_key', webhookKey)
        .eq('provider', provider)
        .eq('active', true)
        .single();

    if (error || !route) {
        return NextResponse.json({ error: "Invalid or inactive webhook key" }, { status: 404 });
    }

    // 2. Fetch Secrets
    // 2. Fetch Secrets (Decrypted)
    const secrets = await getProjectSecrets(route.project_id, provider) || {};

    // 3. Read Body
    const bodyText = await req.text();
    let bodyJson: any = {};
    try { bodyJson = JSON.parse(bodyText); } catch (e) { }

    // 4. Verify Signature (Standardized)
    let isValid = false;
    let errorMessage = "Invalid Signature";

    try {
        const connector = await getConnector(provider);
        if (!connector) {
            errorMessage = `Connector not found for provider: ${provider}`;
            console.error(errorMessage);
        } else {
            const verification = await connector.verifyWebhook(bodyText, Object.fromEntries(req.headers), secrets);
            isValid = verification.ok;
            if (!isValid && verification.reason) {
                errorMessage = verification.reason;
            }
        }
    } catch (err: any) {
        console.error(`Verification error for ${provider}:`, err);
        errorMessage = `Verification Exception: ${err.message}`;
    }

    // 5. Ingest Event (Pipeline Contract)
    // Uses centralized logic for idempotency and storage
    let rawEventId: string | undefined;
    let isNew = false;

    try {
        const result = await ingestEvent({
            provider: provider,
            event_type: bodyJson.event || bodyJson.topic || bodyJson.type || "unknown",
            payload: bodyJson,
            headers: Object.fromEntries(req.headers),
            occurred_at: new Date().toISOString(), // Connector specific usually, fallback to now
        } as any, route.org_id, route.project_id);

        rawEventId = result.id;
        isNew = result.isNew;

        // If duplicate (isNew = false), we might still want to return 200.
        // If ingestEvent handled the duplication by returning existing ID, we proceed or skip?
        // Usually we skip processing if it's a duplicate, unless we force re-process.
        // For now, let's log and maybe skip enqueueing if it's not new?
        // Actually, sometimes we want to retry processing if previous attempt failed.
        // But `ingestEvent` returns the ID.

    } catch (err: any) {
        console.error("Ingest failed:", err);
        return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
    }

    // 6. Enqueue 'normalize_event' Job (Async)
    // Only if signature is valid.
    if (isValid && rawEventId) {
        await enqueueJob(route.org_id, 'normalize_event', {
            raw_event_id: rawEventId,
            provider: provider,
        }, route.project_id);
    } else if (!isValid) {
        // If we ingested but it's invalid, we might want to mark it as ignored or error in DB?
        // ingestEvent sets status='pending' by default. 
        // We should probably update it to 'ignored' if invalid signature.
        if (rawEventId) {
            await supabase.from('external_events_raw')
                .update({
                    status: 'ignored',
                    error_message: errorMessage
                })
                .eq('id', rawEventId);
        }
    }

    return NextResponse.json({ received: true });
}
