
import { describe, it, expect } from 'vitest';
import { HotmartConnector } from './connector';
import { OrderStatus } from '@/lib/contracts/canonical';

describe('Hotmart Connector', () => {
    const connector = new HotmartConnector();

    it('should normalize PURCHASE_APPROVED event', () => {
        const rawPayload = {
            event: 'PURCHASE_APPROVED',
            purchase_date: 1672531200000,
            transaction: 'HP123456',
            product: { name: 'Course A' },
            price: { value: 99.90 },
            full_price: 99.90,
            buyer: { name: 'John Doe', email: 'john@example.com' }
        };

        const rawEvent = {
            provider: 'hotmart',
            event_type: 'PURCHASE_APPROVED',
            payload: rawPayload,
            headers: {},
            occurred_at: new Date(1672531200000)
        };

        const canonicalEvents = connector.normalize(rawEvent);
        expect(canonicalEvents).toHaveLength(1);
        const order = canonicalEvents[0].data as any;

        expect(order.total_cents).toBe(9990);
        expect(order.status).toBe(OrderStatus.CONFIRMED);
        expect(canonicalEvents[0].refs.provider_object_id).toBe('HP123456');
    });
});
