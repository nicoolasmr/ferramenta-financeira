
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig, verifyWebhookSignature } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";
import { verifySignature } from "./verifySignature"; // Reusing existing util

export class KiwifyConnector extends BaseConnectorV2 {
    providerKey = "kiwify";
    displayName = "Kiwify";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: false,
        subscriptions: true,
        payouts: false,
        disputes: true,
        refunds: true,
        installments: true,
        commissions: true, // Kiwify supports co-production
        affiliates: true,
        multi_currency: false
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'hmac_signature', // Or query token? VerifySignature checks query params usually
            recommendedEvents: [
                { code: 'order_approved', label: 'Order Approved' }
            ],
            fields: [
                {
                    key: "webhook_token",
                    label: "Token (Signature)",
                    type: "password",
                    required: true,
                    help: "Found in Kiwify Webhook Settings"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Configure Webhook",
                    description: `Paste URL: \`${url}\``,
                    action: { label: "Go to Kiwify", url: "https://dashboard.kiwify.com.br/apps/webhooks" }
                }
            ]
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        // Use SDK centralized logic
        return verifyWebhookSignature('header_token', body, headers, secrets, { secretKey: 'token' });
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        const body = raw.payload || raw;
        const status = body.order_status;
        const events: NormalizedEvent[] = [];

        // Kiwify Payloads
        // paid: order_approved
        // refunded: order_refunded
        // chargedback: order_chargedback

        if (status === 'paid') {
            const amount = body.Commission?.charge_amount || body.order_total_value_cents / 100 || 0; // Check real payload structure
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: body.order_id,
                occurred_at: body.approved_date ? new Date(body.approved_date).toISOString() : new Date().toISOString(),
                canonical_module: 'sales',
                canonical_type: 'sales.order.paid',
                payload: body,
                money: {
                    amount_cents: body.order_total_value_cents || Math.round(amount * 100),
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'order', external_id: body.order_id }]
            });
        }
        else if (status === 'refunded') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: body.order_id, // Or refund_id if available?
                occurred_at: new Date().toISOString(),
                canonical_module: 'disputes',
                canonical_type: 'refunds.created',
                payload: body,
                money: {
                    amount_cents: body.order_total_value_cents, // Full refund usually?
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'order', external_id: body.order_id }]
            });
        }

        else if (status === 'chargedback') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: body.order_id,
                occurred_at: new Date().toISOString(),
                canonical_module: 'disputes',
                canonical_type: 'disputes.opened',
                payload: body,
                money: {
                    amount_cents: body.order_total_value_cents,
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'order', external_id: body.order_id }]
            });
        }

        return events;
    }
}
