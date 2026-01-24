
import { describe, it, expect } from 'vitest';
import { StripeConnector } from './connector';
import { PaymentStatus } from '@/lib/contracts/canonical';

describe('Stripe Connector', () => {
    const connector = new StripeConnector();

    it('should normalize charge.succeeded event', () => {
        const rawPayload = {
            id: 'evt_test_charge',
            object: 'event',
            type: 'charge.succeeded',
            created: 1672531200,
            data: {
                object: {
                    id: 'ch_test_123',
                    object: 'charge',
                    amount: 2000,
                    currency: 'brl',
                    payment_intent: 'pi_test_123',
                    status: 'succeeded'
                }
            }
        };

        const rawEvent = {
            provider: 'stripe',
            event_type: 'charge.succeeded',
            payload: rawPayload,
            headers: {},
            occurred_at: new Date(1672531200000)
        };

        const canonicalEvents = connector.normalize(rawEvent);

        expect(canonicalEvents).toHaveLength(1);
        const event = canonicalEvents[0];

        expect(event.domain_type).toBe('payment');
        expect(event.provider).toBe('stripe');

        // Assert Data
        const payment = event.data as any;
        expect(payment.amount_cents).toBe(2000);
        expect(payment.currency).toBe('BRL');
        expect(payment.status).toBe(PaymentStatus.PAID);

        // Assert References
        expect(event.refs.provider_object_id).toBe('ch_test_123');
        expect(event.refs.provider_related_id).toBe('pi_test_123');
    });

    it('should ignore unrelated events', () => {
        const rawEvent = {
            provider: 'stripe',
            event_type: 'customer.created',
            payload: { type: 'customer.created' },
            headers: {},
            occurred_at: new Date()
        };

        const canonicalEvents = connector.normalize(rawEvent);
        expect(canonicalEvents).toHaveLength(0);
    });
});
