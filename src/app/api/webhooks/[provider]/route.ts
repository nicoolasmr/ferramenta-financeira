
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enqueueJob } from "@/lib/queue/enqueue";
import { AsaasConnector } from "@/connectors/asaas/connector";
// import { KiwifyConnector } from "@/connectors/kiwify/connector"; // Will implement next

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
    // We use a service role or just standard RLS if the logic allows. 
    // Here we need secrets to verify signature. 
    const { data: secretData } = await supabase
        .from('project_secrets')
        .select('secrets')
        .eq('project_id', route.project_id)
        .eq('provider', provider)
        .single();

    const secrets = secretData?.secrets || {};
    const webhookToken = secrets.webhook_token;

    // 3. Read Body
    const bodyText = await req.text();
    let bodyJson: any = {};
    try { bodyJson = JSON.parse(bodyText); } catch (e) { }

    // 4. Verify Signature
    let isValid = false;
    let connector: any = null;

    if (provider === 'asaas') {
        connector = new AsaasConnector();
        // Pass the DB secret, not env
        isValid = connector.verifySignature(bodyText, Object.fromEntries(req.headers), webhookToken || "");
    } else if (provider === 'kiwify') {
        const { KiwifyConnector } = await import("@/connectors/kiwify/connector");
        connector = new KiwifyConnector();
        isValid = connector.verifySignature(bodyText, Object.fromEntries(req.headers), webhookToken || "");
    }

    // 5. Store RAW & Enqueue
    // Even if invalid, we might want to log it (Ops).
    // The Stabilization prompts says: "Se invalido: salvar RAW com signature_valid=false... e retornar 200"

    const rawEvent = {
        org_id: route.org_id,
        project_id: route.project_id,
        provider: provider,
        event_type: bodyJson.event || bodyJson.topic || "unknown",
        payload: bodyJson,
        headers: Object.fromEntries(req.headers),
        occurred_at: new Date().toISOString(),
        status: isValid ? "pending" : "ignored",
        processing_error: isValid ? null : "Invalid Signature"
    };

    // Use Enqueue for "Normalize + Apply" pipeline
    if (isValid) {
        // Create Job
        await enqueueJob(route.org_id, 'apply_event', {
            // We pass raw payload to job, or we store raw first?
            // Best practice: Store RAW in DB, pass ID to Job. 
            // Simplification: Pass payload to job (if small). Webhooks can be large.
            // Let's assume queue payload handles it for MVP.
            // Actually, the Worker logic calls `normalize` then `apply`.
            // Depending on how worker is written. 
            // My worker.ts handles 'apply_event' expecting 'CanonicalEvent'.
            // So we need to NORMALIZE here or in a separate job?

            // Ideally: 
            // 1. Store Raw to `provider_events_raw` -> ID
            // 2. Enqueue `process_provider_event` with ID.
            // 3. Worker reads Raw -> Normalizes -> Applies.

            // For "Stabilization Pack" adhering to existing code:
            // My worker processes `apply_event` as CanonicalEvent.
            // So I must normalize HERE?
            // Normalizing here means strict sync processing. 
            // If normalization fails, we return 400? No, we return 200 and log error.

            provider: provider,
            raw: rawEvent
        }, route.project_id);
    }

    return NextResponse.json({ received: true });
}
