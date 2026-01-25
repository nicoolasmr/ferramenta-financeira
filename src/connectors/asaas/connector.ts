
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class AsaasConnector extends BaseConnectorV2 {
    providerKey = "asaas";
    displayName = "Asaas";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: true,
        subscriptions: true,
        payouts: false,
        disputes: false,
        refunds: true,
        installments: true,
        commissions: false,
        affiliates: false,
        multi_currency: false
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'header_token',
            recommendedEvents: [
                { code: 'PAYMENT_CONFIRMED', label: 'Payment Paid' },
                { code: 'PAYMENT_OVERDUE', label: 'Payment Overdue' }
            ],
            fields: [
                {
                    key: "webhook_token",
                    label: "Access Token",
                    type: "password",
                    required: true,
                    description: "Generated in Asaas Integrations"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Configure Webhook",
                    description: `Paste URL: \`${url}\``,
                    action: { label: "Go to Asaas", url: "https://www.asaas.com/customerConfigIntegration" }
                }
            ]
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        const token = headers["asaas-access-token"];
        if (token === secrets["webhook_token"]) return { ok: true };
        return { ok: false, reason: "Token mismatch" };
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        const body = raw.payload || raw;
        const type = body.event;
        const payment = body.payment;

        if (!payment) return [];

        const events: NormalizedEvent[] = [];

        if (type === 'PAYMENT_CONFIRMED' || type === 'PAYMENT_RECEIVED') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: payment.id,
                occurred_at: body.payment.dateCreated ? new Date(body.payment.dateCreated).toISOString() : new Date().toISOString(),
                canonical_module: 'sales',
                canonical_type: 'sales.payment.succeeded',
                payload: payment,
                money: {
                    amount_cents: Math.round(payment.value * 100),
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'payment', external_id: payment.id }]
            });
        }
        else if (type === 'PAYMENT_REFUNDED') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: payment.id,
                occurred_at: new Date().toISOString(),
                canonical_module: 'disputes',
                canonical_type: 'refunds.created',
                payload: payment,
                money: {
                    amount_cents: Math.round(payment.value * 100),
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'payment', external_id: payment.id }]
            });
        }
        else if (type === 'PAYMENT_OVERDUE') {
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: payment.id,
                occurred_at: new Date().toISOString(),
                canonical_module: 'sales',
                canonical_type: 'sales.payment.failed', // Mapped to failed/overdue
                payload: payment,
                money: {
                    amount_cents: Math.round(payment.value * 100),
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'payment', external_id: payment.id }]
            });
        }

        return events;
    }
}
