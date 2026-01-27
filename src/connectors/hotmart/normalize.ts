import { CanonicalEvent } from "../_shared/types";

export function normalize(body: any): CanonicalEvent[] {
    const events: CanonicalEvent[] = [];
    const timestamp = new Date().toISOString(); // Hotmart doesn't always send a clear event timestamp, using received.
    const eventId = body.transaction || body.id || `hm_${Date.now()}`;

    // Map Hotmart Events to Canonical
    // PURCHASE_COMPLETE -> order.created (and payment.confirmed implied)
    // PURCHASE_CANCELED -> subscription.canceled or order.canceled?

    if (body.event === 'PURCHASE_COMPLETE' || body.status === 'APPROVED') {
        // Order Created
        events.push({
            canonical_type: 'order.created',
            provider: 'hotmart',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: body.transaction,
                status: 'paid',
                amount_cents: Math.round((body.price?.value || 0) * 100),
                currency: body.price?.currency_code || 'BRL',
                customer_email: body.buyer?.email,
                customer_name: body.buyer?.name,
                customer_phone: body.buyer?.checkout_phone,
                metadata: { product_id: body.product?.id },
                created_at: timestamp,
                raw_payload: body
            }
        });

        // Implicit Payment Confirmed
        events.push({
            canonical_type: 'payment.confirmed',
            provider: 'hotmart',
            external_event_id: eventId + '_pay',
            timestamp,
            payload: {
                external_id: body.transaction, // Same mapping for Hotmart often
                status: 'paid',
                amount_cents: Math.round((body.price?.value || 0) * 100),
                created_at: timestamp,
                raw_payload: body
            }
        });
    }

    if (body.event === 'PURCHASE_REFUNDED' || body.status === 'REFUNDED') {
        events.push({
            canonical_type: 'refund.confirmed',
            provider: 'hotmart',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: body.transaction,
                status: 'refunded',
                amount_cents: Math.round((body.price?.value || 0) * 100),
                created_at: timestamp,
                raw_payload: body
            }
        });
    }

    return events;
}
