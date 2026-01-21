import { describe, it, expect } from 'vitest';
import { normalize } from './normalize';

describe('Hotmart Connector Contract', () => {
    it('should normalize PURCHASE_COMPLETE to order.created and payment.confirmed', () => {
        const payload = {
            id: 'evt_hm_123',
            event: 'PURCHASE_COMPLETE',
            transaction: 'HP1234567890',
            status: 'APPROVED',
            price: {
                value: 97.00,
                currency_code: 'BRL'
            },
            buyer: {
                email: 'buyer@example.com',
                name: 'John Doe',
                checkout_phone: '+5511999999999'
            },
            product: {
                id: '123456'
            }
        };

        const events = normalize(payload);

        expect(events).toHaveLength(2);

        // Event 1: Order Created
        const orderEvent = events[0];
        expect(orderEvent.canonical_type).toBe('order.created');
        expect(orderEvent.provider).toBe('hotmart');
        expect(orderEvent.payload.external_id).toBe('HP1234567890');
        expect(orderEvent.payload.amount_cents).toBe(9700);
        expect(orderEvent.payload.customer_email).toBe('buyer@example.com');
        expect(orderEvent.payload.status).toBe('paid');

        // Event 2: Payment Confirmed
        const paymentEvent = events[1];
        expect(paymentEvent.canonical_type).toBe('payment.confirmed');
        expect(paymentEvent.provider).toBe('hotmart');
        expect(paymentEvent.payload.external_id).toBe('HP1234567890');
        expect(paymentEvent.payload.status).toBe('paid');
        expect(paymentEvent.payload.amount_cents).toBe(9700);
    });

    it('should normalize PURCHASE_REFUNDED to refund.confirmed', () => {
        const payload = {
            id: 'evt_hm_999',
            event: 'PURCHASE_REFUNDED',
            transaction: 'HP1234567890',
            status: 'REFUNDED',
            price: {
                value: 97.00,
                currency_code: 'BRL'
            },
            buyer: {
                email: 'buyer@example.com'
            }
        };

        const events = normalize(payload);

        expect(events).toHaveLength(1);
        const refundEvent = events[0];

        expect(refundEvent.canonical_type).toBe('refund.confirmed');
        expect(refundEvent.payload.external_id).toBe('HP1234567890');
        expect(refundEvent.payload.status).toBe('refunded');
        expect(refundEvent.payload.amount_cents).toBe(9700);
    });
});
