export type CanonicalStatus = 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded' | 'chargeback' | 'failed';

export type CanonicalEventType =
    | 'order.created'
    | 'order.updated'
    | 'payment.created'
    | 'payment.confirmed'
    | 'payment.failed'
    | 'payment.overdue'
    | 'refund.created'
    | 'refund.confirmed'
    | 'chargeback.opened'
    | 'chargeback.closed'
    | 'subscription.created'
    | 'subscription.updated'
    | 'subscription.canceled';

export interface CanonicalPayload {
    external_id: string; // The primary ID of the entity (order_id, payment_id, etc.)
    status: CanonicalStatus;
    amount_cents?: number;
    currency?: string;
    customer_email?: string;
    customer_name?: string;
    customer_phone?: string;
    items?: Array<{
        external_id: string;
        name: string;
        quantity: number;
        unit_price_cents: number;
    }>;
    created_at: string; // ISO 8601
    metadata?: Record<string, any>;
    raw_payload?: any; // Ensure we can trace back
}

export interface CanonicalEvent {
    canonical_type: CanonicalEventType;
    payload: CanonicalPayload;
    provider: string;
    external_event_id: string; // The webhook ID or unique event ID from provider
    timestamp: string; // When the event occurred (ISO 8601)
}

export interface SignatureVerificationResult {
    isValid: boolean;
    reason?: string;
}
