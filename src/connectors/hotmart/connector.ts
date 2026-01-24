
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class HotmartConnector extends BaseConnectorV2 {
    providerKey = "hotmart";
    displayName = "Hotmart";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: false,
        subscriptions: true,
        payouts: false,
        disputes: true,
        refunds: true,
        installments: true,
        commissions: true,
        affiliates: true,
        multi_currency: true
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'header_token',
            recommendedEvents: [
                { code: 'PURCHASE_APPROVED', label: 'Purchase Approved' },
                { code: 'REFUND', label: 'Refunded' },
                { code: 'DISPUTE', label: 'Dispute' }
            ],
            fields: [
                {
                    key: "hottok",
                    label: "Hottok",
                    type: "password",
                    required: true,
                    help: "Found in Hotmart Webhook Credentials"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Configure Webhook",
                    description: `Paste URL: \`${url}\``,
                    action: { label: "Go to Hotmart", url: "https://app.hotmart.com/tools/webhook" }
                }
            ]
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        const hottok = headers["x-hotmart-hottok"];
        if (hottok === secrets["hottok"]) return { ok: true };
        return { ok: false, reason: "Hottok mismatch" };
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        const body = raw.payload || raw;
        const event = body.event;
        const data = body.data || body; // Hotmart payloads vary (v1/v2)

        if (!data) return [];
        const events: NormalizedEvent[] = [];

        if (event === 'PURCHASE_APPROVED') {
            // Sales
            const amount = data.price?.value || data.full_price;
            events.push({
                provider_key: this.providerKey,
                project_id: ctx.project_id,
                org_id: ctx.org_id,
                trace_id: ctx.trace_id,
                external_event_id: data.transaction || data.purchase_id,
                occurred_at: data.purchase_date ? new Date(data.purchase_date).toISOString() : new Date().toISOString(),
                canonical_module: 'sales',
                canonical_type: 'sales.order.paid', // Hotmart is Order+Payment combined
                payload: data,
                money: {
                    amount_cents: Math.round(amount * 100),
                    currency: 'BRL'
                },
                external_refs: [{ kind: 'transaction', external_id: data.transaction }]
            });

            // Commissions (Stub)
            if (data.commissions) {
                events.push({
                    provider_key: this.providerKey,
                    project_id: ctx.project_id,
                    org_id: ctx.org_id,
                    trace_id: ctx.trace_id,
                    external_event_id: `${data.transaction}_comm`,
                    occurred_at: new Date().toISOString(),
                    canonical_module: 'commissions',
                    canonical_type: 'commissions.created',
                    payload: data.commissions,
                    external_refs: [{ kind: 'transaction', external_id: data.transaction }]
                });
            }
        }

        return events;
    }
}
