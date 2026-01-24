
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider, PaymentStatus } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";

export class AsaasConnector extends BaseConnector {
    provider: CanonicalProvider = "asaas";

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        const token = headers["asaas-access-token"];
        return token === secret;
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        return {
            provider: this.provider,
            event_type: body.event,
            payload: body,
            headers: headers,
            occurred_at: new Date(body.payment?.dateCreated || Date.now())
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        const event = raw.payload;
        // Asaas events: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, ...

        if (event.event === "PAYMENT_CONFIRMED" || event.event === "PAYMENT_RECEIVED") {
            const payment = event.payment;
            return [{
                org_id: "unknown",
                env: "production",
                provider: this.provider,
                provider_event_type: event.event,
                occurred_at: raw.occurred_at.toISOString(),
                domain_type: "payment",
                data: {
                    amount_cents: Math.round(payment.value * 100),
                    currency: "BRL",
                    status: PaymentStatus.PAID,
                    method: payment.billingType === "PIX" ? "pix" : "boleto", // simplified
                    installments: 1,
                    fee_cents: 0,
                    net_cents: Math.round(payment.netValue * 100)
                },
                refs: {
                    provider_object_id: payment.id
                }
            }];
        }
        return [];
    }
}
