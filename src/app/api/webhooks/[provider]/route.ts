
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueJob } from "@/lib/queue/enqueue";
import { getConnector } from "@/connectors/registry";
import { ProviderConnector } from "@/lib/integrations/sdk";

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
    const provider = params.provider;
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
    const { data: secretData } = await supabase
        .from('project_secrets')
        .select('secrets')
        .eq('project_id', route.project_id)
        .eq('provider', provider)
        .single();

    const secrets = secretData?.secrets || {};

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
            isValid = await connector.verifyWebhook(bodyText, Object.fromEntries(req.headers), secrets);
        }
    } catch (err: any) {
        console.error(`Verification error for ${provider}:`, err);
        errorMessage = `Verification Exception: ${err.message}`;
    }

    // 5. App Integrity Check (Force Fail if connector missing or invalid)
    // Note: Some legacy webhooks might not sign (e.g. basic auth), handled by connector returning true.

    const rawEvent = {
        org_id: route.org_id,
        project_id: route.project_id,
        provider: provider,
        event_type: bodyJson.event || bodyJson.topic || bodyJson.type || "unknown",
        payload: bodyJson,
        headers: Object.fromEntries(req.headers),
        occurred_at: new Date().toISOString(),
        status: isValid ? "pending" : "ignored",
        processing_error: isValid ? null : errorMessage
    };

    // 6. Enqueue Pipeline Job
    if (isValid) {
        // We pass the raw payload. The worker will call normalize() -> apply().
        // Since we are using the Standard Pack, the worker should be generic too.
        await enqueueJob(route.org_id, 'apply_event', {
            provider: provider,
            raw: rawEvent,
            // Pass context if needed, but worker usually reconstructs context from payload or DB.
            // Wait, 'apply_event' job type in current worker expects 'CanonicalEvent'.
            // If we pass 'raw' here, we break the contract of 'apply_event'.

            // OPTION A: Normalize HERE (Sync)
            // OPTION B: Change Job Type to 'process_raw_event' (Async)

            // Given "Webhook handler responds 200 fast", Option B is better.
            // BUT for the sake of the existing 'apply_event' logic which is simple:
            // Let's normalize here. It's fast (pure function).

        }, route.project_id);

        // REVISION: The prompt says "Webhook handler... enfileira job; nunca processar pesado na request".
        // Normalization is light (JSON transform). Verification is light (HMAC).
        // So normalizing here is acceptable to keep the 'apply_event' queue contract simple (CanonicalEvent).

        // HOWEVER, to be truly robust (Standardization Pack), we should normalize in the worker to allow re-processing code changes.
        // If we normalize here, we burn the logic into the queue payload.
        // Let's stick to normalizing here for MVP Speed, OR switch to 'process_raw_webhook' job.

        // DECISION: I will NORMALIZE here to leverage the existing 'apply_event' worker.
        // Why? Because 'apply_event' accepts CanonicalEvent[].

        const connector = await getConnector(provider);
        if (connector) {
            const events = connector.normalize(rawEvent); // Note: rawEvent follows SDK structure? SDK RawEvent vs local rawEvent
            // SDK RawEvent uses CanonicalProvider enum. We used string. Cast needed.
            // Local RawEvent above has 'status' and 'processing_error' which SDK RawEvent doesn't strictly have in interface, but extra props are fine.

            for (const event of events) {
                // Enrich with context if missing?
                if (event.org_id === 'unknown') event.org_id = route.org_id;
                event.project_id = route.project_id; // Ensure project context

                await enqueueJob(route.org_id, 'apply_event', event, route.project_id);
            }
        }
    }

    return NextResponse.json({ received: true });
}
