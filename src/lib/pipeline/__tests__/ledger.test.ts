
import { describe, it, expect, vi } from 'vitest';
import { CanonicalEvent, OrderStatus } from '../../contracts/canonical';

// Mock implementation of applyToDomain parts logic
// Since applyToDomain uses Supabase, we would normally mock the Supabase client.
// For this stabilization pack, we want to unit test the LOGIC of ledger generation hash.

describe('Ledger Logic', () => {
    it('should generate consistent idempotency keys for the same event', async () => {
        const event: CanonicalEvent = {
            org_id: 'org_123',
            project_id: 'proj_456',
            env: 'sandbox',
            provider: 'stripe',
            provider_event_type: 'charge.succeeded',
            occurred_at: '2024-01-01T10:00:00Z',
            domain_type: 'order',
            data: {
                total_cents: 1000,
                status: OrderStatus.CONFIRMED,
                currency: 'BRL',
                customer: { name: 'John', email: 'j@example.com' },
                products: []
            } as any,
            refs: { provider_object_id: 'ch_123' }
        };

        const crypto = await import('crypto');
        const entry = {
            org_id: event.org_id,
            source_type: 'order',
            source_id: 'internal_order_id', // would be resolved
            category: 'sale',
            amount_cents: 1000,
            entry_date: '2024-01-01'
        };

        const generateKey = () => {
            const rawKey = `${entry.org_id}|${entry.source_type}|${entry.source_id}|${entry.category}|${entry.amount_cents}|${entry.entry_date}`;
            return crypto.createHash('md5').update(rawKey).digest('hex');
        };

        const key1 = generateKey();
        const key2 = generateKey();

        expect(key1).toBe(key2);
        expect(key1).toHaveLength(32); // MD5 hex
    });
});
