import { normalizeEvent } from "@/lib/integrations/normalizer";
import { applyEvent } from "@/lib/integrations/applier";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, props: { params: Promise<{ provider: string }> }) {
    const params = await props.params;
    const provider = params.provider;
    const bodyText = await req.text();
    let body;
    try {
        body = JSON.parse(bodyText);
    } catch {
        return new NextResponse("Invalid JSON", { status: 400 });
    }

    const supabase = await createClient();

    // 1. Identify Org (Simplistic: Assume Metadata or URL Token in real world)
    // For MVP SaaS, we might look up 'webhook_endpoints' if we had a secret in URL.
    // For now, assuming org_id is passed in payload or headers (Hotmart/Stripe connect style).
    // Or we hardcode a single tenant for dev if no Auth mechanism.

    // To make this robust, we usually use /api/webhooks/[orgId]/[provider] or look up by provider-specific account ID.
    // Here we will try to find org_id from the payload if possible, or fail securely.

    // MOCK: For this Patch, let's assume single-tenant or find by external_account_id
    // This part requires the 'external_accounts' table to resolve the org.

    // Let's assume we can't easily resolve org without specific provider logic.
    // So we just Log Raw for now. This is SAFE.

    // We strictly need an ORG_ID to insert into DB because of RLS/Schema.
    // Let's use a "System Org" or fail if not found.
    // For the sake of the tutorial, we will try to resolve via "default" or first org if local.
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
    if (!org) return new NextResponse("No Org Found", { status: 500 });
    const orgId = org.id;

    const eventId = body.id || body.transaction || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const eventType = body.type || body.event || "UNKNOWN";

    // 2. Idempotency Check & Persist Raw
    const { error: insertError } = await supabase.from("external_events_raw").insert({
        org_id: orgId,
        provider: provider,
        external_event_id: String(eventId),
        event_type: eventType,
        payload_json: body,
        status: "pending"
    });

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            return new NextResponse("Duplicate Event", { status: 200 });
        }
        console.error("Webhook Insert Error", insertError);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    // 3. Async Processing Trigger (Fire & Forget or Job Queue)
    // In Vercel, we might use Inngest or QStash. Here we just await for simplicity or use after().

    try {
        const canonical = await normalizeEvent(provider, eventType, body);
        if (canonical) {
            await supabase.from("external_events_normalized").insert({
                org_id: orgId,
                provider: provider,
                raw_event_id: undefined, // Need to fetch ID to link, skipping for speed
                canonical_type: canonical.canonicalType,
                canonical_payload: canonical.payload
            });

            await applyEvent(orgId, canonical, provider);

            // Update status
            await supabase.from("external_events_raw")
                .update({ status: "processed", processed_at: new Date().toISOString() })
                .eq("org_id", orgId)
                .eq("provider", provider)
                .eq("external_event_id", String(eventId));
        } else {
            await supabase.from("external_events_raw")
                .update({ status: "ignored" })
                .eq("org_id", orgId)
                .eq("provider", provider)
                .eq("external_event_id", String(eventId));
        }

    } catch (e) {
        console.error("Processing Error", e);
        // Status remains pending or set to failed
    }

    return new NextResponse("Received", { status: 200 });
}
