
import { RawEvent } from "@/connectors/sdk/types";
import { CanonicalEvent, PaymentStatus, OrderStatus } from "@/lib/contracts/canonical";

export function normalizeAsaas(raw: RawEvent): CanonicalEvent[] {
    const event = raw.payload;
    const payment = event.payment;

    // Default values
    const occurredAt = new Date(raw.occurred_at || Date.now()).toISOString();
    const amountCents = payment ? Math.round(payment.value * 100) : 0;
    const netCents = payment ? Math.round(payment.netValue * 100) : 0;

    // Common Base
    const base = {
        org_id: raw.org_id || "unknown",
        project_id: raw.project_id,
        env: "production" as "production", // or derive from somewhere
        provider: "asaas" as const,
        provider_event_type: event.event,
        occurred_at: occurredAt,
        refs: {
            provider_object_id: payment?.id || "unknown",
            provider_related_id: payment?.subscription || payment?.installment
        }
    };

    switch (event.event) {
        case "PAYMENT_CONFIRMED":
        case "PAYMENT_RECEIVED":
            return [{
                ...base,
                domain_type: "payment",
                data: {
                    amount_cents: amountCents,
                    currency: "BRL",
                    status: PaymentStatus.PAID,
                    method: mapMethod(payment.billingType),
                    installments: 1, // Logic needed if installment
                    fee_cents: amountCents - netCents,
                    net_cents: netCents
                }
            }];

        case "PAYMENT_REFUNDED":
            return [{
                ...base,
                domain_type: "refund",
                data: {
                    amount_cents: amountCents, // Refunded amount
                    status: "completed" as any // TODO: Add RefundStatus to contract if strict
                } as any // Forcing for MVP, ideally we map to CanonicalRefund
            }, {
                ...base,
                domain_type: "payment",
                data: {
                    amount_cents: amountCents,
                    currency: "BRL",
                    status: PaymentStatus.REFUNDED, // Update payment status
                    method: mapMethod(payment.billingType),
                    installments: 1,
                    fee_cents: 0,
                    net_cents: 0
                }
            }];

        case "PAYMENT_OVERDUE":
            return [{
                ...base,
                domain_type: "payment",
                data: {
                    amount_cents: amountCents,
                    currency: "BRL",
                    status: PaymentStatus.FAILED, // or OVERDUE if added to enum
                    method: mapMethod(payment.billingType),
                    installments: 1,
                    fee_cents: 0,
                    net_cents: 0
                }
            }];

        default:
            return [];
    }
}

function mapMethod(type: string) {
    if (type === "PIX") return "pix";
    if (type === "BOLETO") return "boleto";
    if (type === "CREDIT_CARD") return "credit_card";
    return "other";
}
