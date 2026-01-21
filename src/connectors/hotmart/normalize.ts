import { CanonicalEvent } from "../_shared/types";

type HotmartWebhook = {
    event?: string;
    status?: string;
    transaction?: string;
    id?: string;
    price?: { value?: number; currency_code?: string };
    buyer?: { email?: string; name?: string; checkout_phone?: string };
    product?: { id?: string };
};

export function normalize(body: unknown): CanonicalEvent[] {
    const events: CanonicalEvent[] = [];
    const payload = body as HotmartWebhook;
    const timestamp = new Date().toISOString(); // Hotmart doesn't always send a clear event timestamp, using received.
    const eventId = payload.transaction || payload.id || `hm_${Date.now()}`;

    // Map Hotmart Events to Canonical
    // PURCHASE_COMPLETE -> order.created (and payment.confirmed implied)
    // PURCHASE_CANCELED -> subscription.canceled or order.canceled?

    if (payload.event === 'PURCHASE_COMPLETE' || payload.status === 'APPROVED') {
        // Order Created
        events.push({
            canonical_type: 'order.created',
            provider: 'hotmart',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payload.transaction || "",
                status: 'paid',
                amount_cents: Math.round((payload.price?.value || 0) * 100),
                currency: payload.price?.currency_code || 'BRL',
                customer_email: payload.buyer?.email,
                customer_name: payload.buyer?.name,
                customer_phone: payload.buyer?.checkout_phone,
                metadata: { product_id: payload.product?.id },
                created_at: timestamp,
                raw_payload: payload
            }
        });

        // Implicit Payment Confirmed
        events.push({
            canonical_type: 'payment.confirmed',
            provider: 'hotmart',
            external_event_id: eventId + '_pay',
            timestamp,
            payload: {
                external_id: payload.transaction || "", // Same mapping for Hotmart often
                status: 'paid',
                amount_cents: Math.round((payload.price?.value || 0) * 100),
                created_at: timestamp,
                raw_payload: payload
            }
        });
    }

    if (payload.event === 'PURCHASE_REFUNDED' || payload.status === 'REFUNDED') {
        events.push({
            canonical_type: 'refund.confirmed',
            provider: 'hotmart',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payload.transaction || "",
                status: 'refunded',
                amount_cents: Math.round((payload.price?.value || 0) * 100),
                created_at: timestamp,
                raw_payload: payload
            }
        });
    }

    return events;
}
