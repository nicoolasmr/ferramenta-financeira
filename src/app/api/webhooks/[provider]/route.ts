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
    } catch (err: any) {
        console.error("Ingest failed:", err);
        return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
    }

    // 6. Sync Normalization (Fast-Fail)
    // "Regras de Webhook Runtime (do SSOT): 5) Normalize (sync/fast-fail) => NormalizedEvent[]"
    if (isValid && rawEventId) {
        try {
            const connector = await getConnector(provider);
            if (connector) {
                // We normalize immediately
                const normalizedEvents = await connector.normalize(
                    {
                        payload: bodyJson,
                        event_type: bodyJson.event || bodyJson.topic || "unknown",
                        headers: Object.fromEntries(req.headers)
                    },
                    {
                        org_id: route.org_id,
                        project_id: route.project_id,
                        trace_id: rawEventId
                    }
                );

                // 7. Enqueue Apply Jobs
                for (const evt of normalizedEvents) {
                    // Ensure we link the canonical event to the raw event for tracing
                    evt.external_event_id = rawEventId;
                    await enqueueJob(route.org_id, 'apply_event', evt, route.project_id);
                }

                return NextResponse.json({ received: true, processed: normalizedEvents.length });
            }
        } catch (normError: any) {
            console.error("Normalization Error:", normError);
            // We accepted the raw event, but failed to process. 
            // Return 200 (since we have the raw data safely stored) but log error.
            // Or return 400 if we want the provider to retry?
            // "Ack 200 OK" rule implies we generally return 200 if raw is saved.
            // But if normalization fails, we might want to flag it in DB.
            if (rawEventId) {
                await supabase.from('external_events_raw')
                    .update({
                        status: 'normalization_failed',
                        error_message: normError.message
                    })
                    .eq('id', rawEventId);
            }
            return NextResponse.json({ received: true, warning: "Normalization failed" });
        }
    } else if (!isValid) {
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
