
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import Stripe from "stripe";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class StripeConnector extends BaseConnectorV2 {
    providerKey = "stripe";
    displayName = "Stripe";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: true,
        subscriptions: true,
        payouts: true,
        disputes: true,
        refunds: true,
        installments: false, // Stripe handles this but usually as subscription or params
        commissions: false,
        affiliates: false,
        multi_currency: true
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'hmac_signature',
            recommendedEvents: [
                { code: 'charge.succeeded', label: 'Payment Succeeded' },
                { code: 'invoice.payment_succeeded', label: 'Subscription Payment' }
            ],
            fields: [
                {
                    key: "webhook_secret",
                    label: "Signing Secret (whsec_...)",
                    type: "password",
                    required: true,
                    help: "Found in Stripe Dashboard > Developers > Webhooks"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Add Endpoint",
                    description: `Go to Stripe Dash and add endpoint: \`${url}\``,
                    action: { label: "Open Stripe", url: "https://dashboard.stripe.com/webhooks" }
                }
            ]
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        try {
            const stripe = new Stripe("dummy", { apiVersion: "2024-12-18.acacia" });
            const sig = headers["stripe-signature"];
            const secret = secrets["webhook_secret"];
            if (!secret) return { ok: false, reason: "Missing secret" };

            stripe.webhooks.constructEvent(body, sig, secret);
            return { ok: true };
        } catch (e: any) {
            return { ok: false, reason: e.message };
        }
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        // raw is the full payload stored in DB
        // payload in raw event usually.
        const body = raw.payload || raw;
        const type = body.type;
        const object = body.data?.object;

        if (!object) return [];

        const events: NormalizedEvent[] = [];

        if (type === 'charge.succeeded') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: object.id,
                occurred_at: new Date(object.created * 1000).toISOString(),
                canonical_module: 'sales',
                canonical_type: 'sales.payment.succeeded',
                payload: object,
                money: {
                    amount_cents: object.amount,
                    currency: object.currency?.toUpperCase() || 'BRL'
                },
                external_refs: [{ kind: 'charge', external_id: object.id }]
            });
        }

        return events;
    }
}
