import { describe, it, expect } from 'vitest';
import Stripe from 'stripe';
import { normalize } from './normalize';

describe('Stripe Connector Contract', () => {
    it('should normalize checkout.session.completed', () => {
        const payload = {
            id: 'evt_test_123',
            created: 1700000000,
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_123',
                    amount_total: 10000,
                    currency: 'brl',
                    customer_details: {
                        email: 'test@example.com',
                        name: 'Test Agent'
                    },
                    metadata: {
                        plan: 'pro'
                    }
                }
            }
        };

        const events = normalize(payload as Stripe.Event);

        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.canonical_type).toBe('order.created');
        expect(event.provider).toBe('stripe');
        expect(event.payload.external_id).toBe('cs_test_123');
        expect(event.payload.amount_cents).toBe(10000);
        expect(event.payload.customer_email).toBe('test@example.com');
        expect(event.payload.status).toBe('paid');
        expect(event.timestamp).toBe('2023-11-14T22:13:20.000Z');
    });

    it('should normalize payment_intent.succeeded', () => {
        const payload = {
            id: 'evt_pi_123',
            created: 1700000000,
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_123',
                    amount: 5000,
                    currency: 'usd',
                    receipt_email: 'payer@example.com'
                }
            }
        };

        const events = normalize(payload as Stripe.Event);
        expect(events).toHaveLength(1);
        expect(events[0].canonical_type).toBe('payment.confirmed');
        expect(events[0].payload.amount_cents).toBe(5000);
        expect(events[0].payload.currency).toBe('USD');
    });
});
