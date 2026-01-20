import { createClient } from "@/lib/supabase/server";

export type SyncResult = {
    processed: number;
    failed: number;
    errors: string[];
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type ExternalEventRecord = {
    id: string;
    provider: string;
    org_id: string;
    event_type: string;
    payload_json: Record<string, unknown>;
};

type StripeCheckoutPayload = {
    id?: string;
    payment_intent?: string;
    amount_total?: number;
    customer_details?: { email?: string };
};

export async function processIntegrationEvents(provider: string, orgId: string): Promise<SyncResult> {
    const supabase = await createClient();
    const result: SyncResult = { processed: 0, failed: 0, errors: [] };

    // 1. Fetch pending events
    const { data: events, error } = await supabase
        .from("external_events")
        .select("*")
        .eq("org_id", orgId)
        .eq("provider", provider)
        .eq("status", "received")
        .limit(50); // Batch size

    if (error || !events) {
        result.errors.push("Failed to fetch events: " + (error?.message || "Unknown"));
        return result;
    }

    // 2. Process Loop
    for (const event of events) {
        try {
            await processSingleEvent(event, supabase);

            // Mark as processed
            await supabase.from("external_events").update({
                status: "processed",
                processed_at: new Date().toISOString()
            }).eq("id", event.id);

            result.processed++;
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            // Mark as failed
            await supabase.from("external_events").update({
                status: "failed",
                error_text: message
            }).eq("id", event.id);

            result.failed++;
            result.errors.push(`Event ${event.id}: ${message}`);
        }
    }

    return result;
}

async function processSingleEvent(event: ExternalEventRecord, supabase: SupabaseClient) {
    const payload = event.payload_json;
    const type = event.event_type;

    // Dispatcher based on Provider + Type
    if (event.provider === "stripe") {
        if (type === "checkout.session.completed") {
            // Handle new Sale
            await handleStripeSale(payload, event.org_id, supabase);
        } else if (type === "invoice.payment_succeeded") {
            // Handle subscription/installment payment
            // await handleStripePayment(payload, event.org_id, supabase);
        }
    }
    // Add other providers...
}

async function handleStripeSale(payload: Record<string, unknown>, orgId: string, supabase: SupabaseClient) {
    // Logic: Find/Create Customer -> Create Order -> Create Payment
    // For MVP, simplistic mapping
    const stripePayload = payload as StripeCheckoutPayload;
    const customerEmail = stripePayload.customer_details?.email;
    const amountTotal = stripePayload.amount_total ?? 0; // cents

    if (!customerEmail) throw new Error("No email in payload");

    // 1. Find Customer
    const { data: customer } = await supabase.from("customers")
        .select("id")
        .eq("org_id", orgId)
        .eq("email", customerEmail)
        .single();

    // If no customer, we might want to create one or skip. 
    // Skipping for safety in this strict logic unless we have full data.
    if (!customer) throw new Error("Customer not found for email: " + customerEmail);

    // 2. Create Order
    const { data: order, error: orderError } = await supabase.from("orders").insert({
        org_id: orgId,
        customer_id: customer.id,
        source: "stripe_webhook",
        external_id: stripePayload.id,
        status: "paid",
        gross_amount_cents: amountTotal,
        net_amount_cents: amountTotal, // simplified
    }).select("id").single();

    if (orderError) throw new Error("Failed to create order");

    // 3. Create Payment
    await supabase.from("payments").insert({
        org_id: orgId,
        order_id: order.id,
        method: "credit_card",
        gateway: "stripe",
        status: "paid",
        amount_cents: amountTotal,
        external_id: stripePayload.payment_intent,
        paid_at: new Date().toISOString()
    });
}
