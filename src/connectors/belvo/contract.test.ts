
import { describe, it, expect } from 'vitest';
import { BelvoConnector } from './connector';

describe('Belvo Connector', () => {
    const connector = new BelvoConnector();
    const ctx = { org_id: 'test_org', project_id: 'test_proj', trace_id: 'test_trace' };

    it('should handle transactions_available webhook', async () => {
        // Belvo sends a notification, not the data itself in this event usually.
        // The current connector creates NO events for this hook (it expects async fetch).
        // This test verifies it returns empty array (non-blocking).

        const rawEvent = {
            provider: 'belvo',
            event_type: 'transactions_available',
            payload: { link: 'link_123' },
            headers: {},
            occurred_at: new Date()
        };

        const canonicalEvents = await connector.normalize(rawEvent, ctx);
        expect(canonicalEvents).toHaveLength(0);
    });
});
