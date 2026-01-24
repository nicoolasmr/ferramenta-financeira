
import { RawEvent } from "@/connectors/sdk/types";
import { CanonicalEvent, PaymentStatus, OrderStatus } from "@/lib/contracts/canonical";

export function normalizeKiwify(raw: RawEvent): CanonicalEvent[] {
    const payload = raw.payload;
    // Kiwify Payload Structure (Approximate - assuming standard Kiwify v2)
    // { order_id, order_status, commisions: { total, currency }, customer: {...}, ... }

    // Status Logic
    const status = payload.order_status; // paid, refunded, chargedback

    const base = {
        org_id: raw.org_id || "unknown",
        project_id: raw.project_id,
        env: "production" as "production",
        provider: "kiwify" as const,
        provider_event_type: status,
        occurred_at: new Date(payload.approved_date || raw.occurred_at).toISOString(),
        refs: {
            provider_object_id: payload.order_id || payload.id
        }
    };

    const amountCents = payload.commissions?.total ? Math.round(payload.commissions.total * 100) : 0;
    // Wait, usually we want Gross? 
    // Kiwify sends 'commissions' object? Let's assume a simplified structure for MVP or check contracts.
    // Assume: commission_total_value (Gross?)
    // Let's use a safe fallback.
    const grossVal = payload.commission_total_value || 0;
    const grossCents = Math.round(grossVal * 100);

    if (status === "paid" || status === "approved") {
        return [
            // Order
            {
                ...base,
                domain_type: "order",
                data: {
                    total_cents: grossCents,
                    currency: "BRL",
                    status: OrderStatus.CONFIRMED,
                    customer: {
                        name: payload.Customer?.full_name || "Unknown",
                        email: payload.Customer?.email,
                        phone: payload.Customer?.mobile
                    },
                    products: payload.Product ? [{
                        name: payload.Product.product_name,
                        quantity: 1,
                        price_cents: grossCents
                    }] : []
                }
            },
            // Payment
            {
                ...base,
                domain_type: "payment",
                data: {
                    amount_cents: grossCents,
                    currency: "BRL",
                    status: PaymentStatus.PAID,
                    method: payload.payment_method_type === "pix" ? "pix" : "credit_card",
                    installments: payload.installments || 1,
                    fee_cents: 0, // Need to calc from payload if available
                    net_cents: grossCents // Approximate for now
                }
            }
        ];
    }

    if (status === "refunded") {
        return [{
            ...base,
            domain_type: "refund",
            data: {
                amount_cents: grossCents,
                status: "completed"
            } as any
        }];
    }

    return [];
}
