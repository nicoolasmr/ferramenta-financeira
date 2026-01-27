import { CanonicalEvent, CanonicalEventType, CanonicalStatus } from "../_shared/types";
import { generateCanonicalHash } from "../_shared/idempotency";
import Stripe from "stripe";

export function normalize(event: Stripe.Event): CanonicalEvent[] {
    const canonicalEvents: CanonicalEvent[] = [];
    const timestamp = new Date(event.created * 1000).toISOString();
    const eventId = event.id;

    if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent;

        canonicalEvents.push({
            canonical_type: 'payment.confirmed',
            provider: 'stripe',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: pi.id,
                status: 'paid',
                amount_cents: pi.amount,
                currency: pi.currency.toUpperCase(),
                customer_email: (pi.receipt_email || undefined),
                metadata: pi.metadata,
                created_at: timestamp,
                raw_payload: pi
            }
        });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Canonical Order
        canonicalEvents.push({
            canonical_type: 'order.created',
            provider: 'stripe',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: session.id,
                status: 'paid', // Checkout session completed usually means paid
                amount_cents: session.amount_total || 0,
                currency: session.currency?.toUpperCase(),
                customer_email: session.customer_details?.email || undefined,
                customer_name: session.customer_details?.name || undefined,
                metadata: session.metadata || undefined,
                created_at: timestamp,
                raw_payload: session
            }
        });
    }

    if (event.type === 'charge.refunded') {
        const charge = event.data.object as Stripe.Charge;
        canonicalEvents.push({
            canonical_type: 'refund.confirmed',
            provider: 'stripe',
            external_event_id: eventId,
            timestamp,
            payload: {
                external_id: charge.payment_intent as string || charge.id, // Reference to original payment
                status: 'refunded',
                amount_cents: charge.amount_refunded,
                created_at: timestamp,
                raw_payload: charge
            }
        });
    }

    // Hash is usually handled by the applier or DB, but we could add it here if defined in type.
    // For now, returning the clean array.

    return canonicalEvents;
}
