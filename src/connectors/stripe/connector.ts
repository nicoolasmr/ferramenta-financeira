
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider, OrderStatus, PaymentStatus } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";
import Stripe from "stripe";

export class StripeConnector extends BaseConnector {
    provider: CanonicalProvider = "stripe";
    private client: Stripe;

    constructor() {
        super();
        this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });
    }

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        const sig = headers["stripe-signature"];
        try {
            this.client.webhooks.constructEvent(body, sig, secret);
            return true;
        } catch (err) {
            return false;
        }
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        // Stripe body is already parsed by Next.js often, but here we assume 'body' is the raw object if we parsed it, or raw string.
        // Actually, parseWebhook logic usually takes the raw body to verify signature? 
        // SDK Design: 'verifySignature' takes raw string. 'parseWebhook' takes raw body or object.
        // Let's assume 'body' passed here is the JSON.

        return {
            provider: this.provider,
            event_type: body.type,
            payload: body,
            headers: headers,
            occurred_at: new Date(body.created * 1000)
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        const event = raw.payload;
        const type = event.type;
        const object = event.data.object;
        const timestamp = new Date(event.created * 1000).toISOString();

        // 1. Payment Intent / Charge Succeeded
        if (type === "charge.succeeded" || type === "payment_intent.succeeded") {
            const amount = object.amount; // cents
            const currency = object.currency.toUpperCase();

            return [{
                org_id: "unknown", // Context needs to be injected or found from metadata
                env: "production", // Default or detect
                provider: this.provider,
                provider_event_type: type,
                occurred_at: timestamp,
                domain_type: "payment",
                data: {
                    amount_cents: amount,
                    currency: currency,
                    status: PaymentStatus.PAID,
                    method: "credit_card", // simplified
                    installments: 1,
                    fee_cents: 0, // Fee is separate usually
                    net_cents: amount // Net needs fee calc
                },
                refs: {
                    provider_object_id: object.id,
                    provider_related_id: object.payment_intent
                }
            }];
        }

        return [];
    }
}
