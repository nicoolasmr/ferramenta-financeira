import { describe, it, expect } from 'vitest';
import { normalize } from './normalize';

describe('Asaas Connector Contract', () => {
    it('should normalize PAYMENT_RECEIVED to payment.confirmed', () => {
        const payload = {
            id: 'evt_asaas_123',
            event: 'PAYMENT_RECEIVED',
            payment: {
                id: 'pay_123456',
                value: 150.00,
                netValue: 145.00,
                dateCreated: '2023-11-20T10:00:00Z',
                billingType: 'PIX'
            }
        };

        const events = normalize(payload);

        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.canonical_type).toBe('payment.confirmed');
        expect(event.provider).toBe('asaas');
        expect(event.payload.external_id).toBe('pay_123456');
        expect(event.payload.amount_cents).toBe(15000);
        expect(event.timestamp).toBe('2023-11-20T10:00:00Z');
    });

    it('should normalize PAYMENT_OVERDUE to payment.overdue', () => {
        const payload = {
            id: 'evt_asaas_456',
            event: 'PAYMENT_OVERDUE',
            payment: {
                id: 'pay_overdue_123',
                value: 150.00,
                dateCreated: '2023-11-10T10:00:00Z'
            }
        };

        const events = normalize(payload);

        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.canonical_type).toBe('payment.overdue');
        expect(event.payload.external_id).toBe('pay_overdue_123');
        expect(event.payload.status).toBe('overdue');
    });
});
