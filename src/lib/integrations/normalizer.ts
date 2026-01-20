import { createClient } from "@/lib/supabase/server";

export type IntegrationProvider = 'stripe' | 'hotmart' | 'asaas' | 'eduzz' | 'kiwify' | 'lastlink';

export type CanonicalEventType =
    | 'order.created'
    | 'order.updated'
    | 'payment.confirmed'
    | 'payment.overdue'
    | 'subscription.canceled';

export type CanonicalEvent = {
    canonicalType: CanonicalEventType;
    externalId: string;
    payload: {
        amountCents?: number;
        status?: string;
        customerEmail?: string;
        customerName?: string;
        externalCustomerId?: string;
        items?: { productId: string; name: string; priceCents: number }[];
        [key: string]: any;
    };
    occurredAt: string;
};

export async function normalizeEvent(provider: string, eventType: string, rawPayload: any): Promise<CanonicalEvent | null> {
    switch (provider) {
        case 'stripe':
            return normalizeStripe(eventType, rawPayload);
        case 'hotmart':
            return normalizeHotmart(eventType, rawPayload);
        // Add others
        default:
            return null;
    }
}

function normalizeStripe(type: string, payload: any): CanonicalEvent | null {
    if (type === 'checkout.session.completed') {
        return {
            canonicalType: 'order.created',
            externalId: payload.id,
            occurredAt: new Date(payload.created * 1000).toISOString(),
            payload: {
                amountCents: payload.amount_total,
                status: 'paid',
                customerEmail: payload.customer_details?.email,
                externalCustomerId: payload.customer,
            }
        };
    }
    return null;
}

function normalizeHotmart(type: string, payload: any): CanonicalEvent | null {
    // Hotmart payload structure varies, assuming standard 'purchase' hook
    if (type === 'PURCHASE_COMPLETE') {
        return {
            canonicalType: 'order.created',
            externalId: payload.transaction,
            occurredAt: new Date(payload.purchase_date).toISOString(),
            payload: {
                amountCents: Math.round(payload.price.value * 100), // Assuming float
                status: 'paid',
                customerEmail: payload.buyer.email,
                customerName: payload.buyer.name,
            }
        };
    }
    return null;
}
