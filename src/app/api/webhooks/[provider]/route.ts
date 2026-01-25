import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueJob } from "@/lib/queue/enqueue";
import { getConnector } from "@/connectors/registry";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";

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

    // 5. Compute Idempotency Key (Hash of provider + payload)
    // We want to avoid duplicate rows for the exact same event delivery
    const payloadHash = crypto.createHash('sha256').update(bodyText).digest('hex');
    const idempotencyKey = `${provider}:${payloadHash}`;

    // 6. Insert into external_events_raw (Strict Ingest)
    // We do this EVEN IF signature is invalid if we want to debug, but strictly speaking we should reject invalid.
    // However, saving invalid events as 'ignored' helps debugging.

    // Note: external_event_id extraction is connector specific, so we skip it for raw for now to keep it generic.
    // We rely on the Normalized Event to extract the ID later.

    const { data: rawEvent, error: rawError } = await supabase.from('external_events_raw').insert({
        org_id: route.org_id,
        project_id: route.project_id,
        provider: provider,
        event_type: bodyJson.event || bodyJson.topic || bodyJson.type || "unknown",
        payload: bodyJson,
        headers: Object.fromEntries(req.headers),
        signature_valid: isValid,
        idempotency_key: idempotencyKey,
        status: isValid ? 'pending' : 'ignored',
        error_message: isValid ? null : errorMessage
    }).select('id').single();

    if (rawError) {
        // If duplicate, we just return 200 (Idempotency)
        if (rawError.code === '23505') { // Unique constraint violation
            return NextResponse.json({ received: true, status: 'duplicate' });
        }
        console.error("Failed to insert raw event:", rawError);
        return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
    }

    // 7. Enqueue 'normalize_event' Job (Async)
    if (isValid && rawEvent) {
        await enqueueJob(route.org_id, 'normalize_event', {
            raw_event_id: rawEvent.id,
            provider: provider,
        }, route.project_id);
    }

    return NextResponse.json({ received: true });
}
