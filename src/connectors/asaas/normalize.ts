import { CanonicalEvent } from "../_shared/types";

type AsaasWebhook = {
    event?: string;
    id?: string;
    payment?: {
        id?: string;
        dateCreated?: string;
        value?: number;
    };
};

export function normalize(body: unknown): CanonicalEvent[] {
    const events: CanonicalEvent[] = [];
    const payload = body as AsaasWebhook;
    const timestamp = payload.payment?.dateCreated || new Date().toISOString();
    const eventId = payload.id || `asaas_${Date.now()}`;

    // Asaas Events: PAYMENT_RECEIVED, PAYMENT_OVERDUE

    if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
        const payment = payload.payment;
        events.push({
            canonical_type: 'payment.confirmed',
            provider: 'asaas',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payment?.id || "",
                status: 'paid',
                amount_cents: Math.round((payment?.value || 0) * 100),
                customer_email: undefined, // Asaas sends customer ID, need lookup usually, leaving empty
                created_at: timestamp,
                raw_payload: payload
            }
        });
    }

    if (payload.event === 'PAYMENT_OVERDUE') {
        const payment = payload.payment;
        events.push({
            canonical_type: 'payment.overdue',
            provider: 'asaas',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: payment?.id || "",
                status: 'overdue',
                created_at: timestamp,
                raw_payload: payload
            }
        });
    }

    return events;
}
