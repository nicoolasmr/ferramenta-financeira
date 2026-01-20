import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getConnector } from "@/connectors/registry";
import { applyEvent } from "@/lib/integrations/applier";
import { CanonicalEvent } from "@/connectors/_shared/types";
import { generateCanonicalHash } from "@/connectors/_shared/idempotency";

export async function POST(req: NextRequest, props: { params: Promise<{ provider: string }> }) {
    const params = await props.params;
    const provider = params.provider;

    const connector = getConnector(provider);
    if (!connector) {
        return new NextResponse(`Provider ${provider} not supported`, { status: 404 });
    }

    const bodyText = await req.text();
    const { isValid, reason } = await connector.verifySignature(req, bodyText);

    if (!isValid) {
        console.warn(`Webhook Signature Failed [${provider}]: ${reason}`);
        return new NextResponse("Unauthorized", { status: 401 });
    }

    let bodyJson;
    try {
        bodyJson = JSON.parse(bodyText);
    } catch {
        return new NextResponse("Invalid JSON", { status: 400 });
    }

    const supabase = await createClient();

    // Resolve Org (Simplified)
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
    if (!org) return new NextResponse("Configuration Error: No Org", { status: 500 });
    const orgId = org.id;

    // Canonicalize
    let canonicalEvents: CanonicalEvent[] = [];
    try {
        canonicalEvents = connector.normalize(bodyJson, req.headers);
    } catch (err: unknown) {
        console.error(`Normalization Error [${provider}]:`, err);
    }

    // Persist Raw
    const eventId = canonicalEvents[0]?.external_event_id || bodyJson.id || bodyJson.transaction || `evt_${Date.now()}`;
    const eventType = canonicalEvents[0]?.canonical_type || bodyJson.type || bodyJson.event || 'UNKNOWN';

    const { error: insertError } = await supabase.from("external_events_raw").insert({
        org_id: orgId,
        provider: provider,
        external_event_id: String(eventId),
        event_type: eventType,
        payload_json: bodyJson,
        status: canonicalEvents.length > 0 ? "processed" : "ignored",
        processed_at: canonicalEvents.length > 0 ? new Date().toISOString() : null
    });

    if (insertError && insertError.code !== '23505') {
        console.error("Raw Insert Error", insertError);
    }

    // Persist Canonical & Apply
    for (const event of canonicalEvents) {
        const hash = generateCanonicalHash(event);

        const { error: normError } = await supabase.from("external_events_normalized").insert({
            org_id: orgId,
            provider: provider,
            raw_event_id: String(eventId),
            canonical_type: event.canonical_type,
            canonical_payload: event.payload,
        });

        if (!normError || normError.code === '23505') {
            await applyEvent(orgId, event, provider);
        }
    }

    return new NextResponse("Received", { status: 200 });
}
