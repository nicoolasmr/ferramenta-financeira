
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider, OrderStatus, PaymentStatus } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";

export class HotmartConnector extends BaseConnector {
    provider: CanonicalProvider = "hotmart";

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        // Hotmart uses "hottok" often or valid HMAC.
        // For MVP assuming Token match if headers contain it, or relying on body "hottok" if sent there.
        // Actually Hotmart 2.0 uses 'X-Hotmart-Hottok'
        return headers["x-hotmart-hottok"] === secret;
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        return {
            provider: this.provider,
            event_type: body.event || "PURCHASE_APPROVED", // Hotmart 1.0 vs 2.0 varies
            payload: body,
            headers: headers,
            occurred_at: new Date(body.purchase_date || Date.now())
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        const event = raw.payload;
        // Hotmart often sends 'PURCHASE_APPROVED'
        // Only processing approved (paid) for MVP

        if (event.event === "PURCHASE_APPROVED" || event.status === "APPROVED") {
            const amount = event.price?.value || event.full_price; // varies by version

            return [{
                org_id: "unknown",
                env: "production",
                provider: this.provider,
                provider_event_type: "PURCHASE_APPROVED",
                occurred_at: raw.occurred_at.toISOString(),
                domain_type: "order", // Hotmart usually is Order + Payment combined
                data: {
                    customer: {
                        name: event.buyer?.name,
                        email: event.buyer?.email
                    },
                    products: [{
                        name: event.product?.name || "Product",
                        quantity: 1,
                        price_cents: Math.round(amount * 100)
                    }],
                    total_cents: Math.round(amount * 100),
                    currency: "BRL",
                    status: OrderStatus.CONFIRMED
                },
                refs: {
                    provider_object_id: event.transaction || event.purchase_id
                }
            }];
        }
        return [];
    }
}
