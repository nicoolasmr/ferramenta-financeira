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
        [key: string]: unknown;
    };
    occurredAt: string;
};

export async function normalizeEvent(provider: string, eventType: string, rawPayload: unknown): Promise<CanonicalEvent | null> {
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

type StripeSessionPayload = {
    id?: string;
    created?: number;
    amount_total?: number;
    customer_details?: { email?: string };
    customer?: string;
};

function normalizeStripe(type: string, payload: unknown): CanonicalEvent | null {
    const data = payload as StripeSessionPayload;
    if (type === 'checkout.session.completed') {
        return {
            canonicalType: 'order.created',
            externalId: data.id || "",
            occurredAt: new Date((data.created || 0) * 1000).toISOString(),
            payload: {
                amountCents: data.amount_total,
                status: 'paid',
                customerEmail: data.customer_details?.email,
                externalCustomerId: data.customer,
            }
        };
    }
    return null;
}

type HotmartPurchasePayload = {
    transaction?: string;
    purchase_date?: string;
    price?: { value?: number };
    buyer?: { email?: string; name?: string };
};

function normalizeHotmart(type: string, payload: unknown): CanonicalEvent | null {
    const data = payload as HotmartPurchasePayload;
    // Hotmart payload structure varies, assuming standard 'purchase' hook
    if (type === 'PURCHASE_COMPLETE') {
        return {
            canonicalType: 'order.created',
            externalId: data.transaction || "",
            occurredAt: new Date(data.purchase_date || Date.now()).toISOString(),
            payload: {
                amountCents: Math.round((data.price?.value || 0) * 100), // Assuming float
                status: 'paid',
                customerEmail: data.buyer?.email,
                customerName: data.buyer?.name,
            }
        };
    }
    return null;
}
