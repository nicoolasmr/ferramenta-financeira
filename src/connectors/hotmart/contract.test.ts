
import { describe, it, expect } from 'vitest';
import { HotmartConnector } from './connector';

describe('Hotmart Connector', () => {
    const connector = new HotmartConnector();
    const ctx = { org_id: 'test_org', project_id: 'test_proj', trace_id: 'test_trace' };

    it('should normalize PURCHASE_APPROVED event', async () => {
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

        const canonicalEvents = await connector.normalize(rawEvent, ctx);
        expect(canonicalEvents).toHaveLength(1);
        const event = canonicalEvents[0];

        expect(event.money!.amount_cents).toBe(9990);
        expect(event.canonical_type).toBe('sales.order.paid');
        expect(event.external_event_id).toBe('HP123456');
    });
});
