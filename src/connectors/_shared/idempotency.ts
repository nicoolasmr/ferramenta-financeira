import crypto from 'crypto';
import { CanonicalEvent } from './types';

// Deterministic hash for "canonical_hash" column in normalized events table
// Ensures that if we re-normalize the exact same content, we get the same hash.
export function generateCanonicalHash(event: CanonicalEvent): string {
    const data = JSON.stringify({
        type: event.canonical_type,
        payload: event.payload,
        provider: event.provider,
        ext_id: event.external_event_id
    });

    return crypto.createHash('sha256').update(data).digest('hex');
}

// Helper to generate a consistent external_id if the provider doesn't give one (rare, but happens)
export function generateSyntheticId(parts: string[]): string {
    return parts.join('_');
}
