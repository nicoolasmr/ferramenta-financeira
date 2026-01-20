import { CanonicalEvent } from "../_shared/types";

export function normalize(body: any): CanonicalEvent[] {
    const events: CanonicalEvent[] = [];
    const timestamp = body.payment?.dateCreated || new Date().toISOString();
    const eventId = body.id || `asaas_${Date.now()}`;

    // Asaas Events: PAYMENT_RECEIVED, PAYMENT_OVERDUE

    if (body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED') {
        const payment = body.payment;
        events.push({
            canonical_type: 'payment.confirmed',
            provider: 'asaas',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payment.id,
                status: 'paid',
                amount_cents: Math.round((payment.value || 0) * 100),
                customer_email: undefined, // Asaas sends customer ID, need lookup usually, leaving empty
                created_at: timestamp,
                raw_payload: body
            }
        });
    }

    if (body.event === 'PAYMENT_OVERDUE') {
        const payment = body.payment;
        events.push({
            canonical_type: 'payment.overdue',
            provider: 'asaas',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payment.id,
                status: 'overdue',
                created_at: timestamp,
                raw_payload: body
            }
        });
    }

    return events;
}
