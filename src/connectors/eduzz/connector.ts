
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class EduzzConnector extends BaseConnectorV2 {
    providerKey = "eduzz";
    displayName = "Eduzz";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: false,
        subscriptions: true,
        payouts: true,
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
            recommendedEvents: [{ code: 'invoice_paid', label: 'Fatura Paga' }],
            fields: [
                {
                    key: "api_key",
                    label: "API Key / Token",
                    type: "password",
                    required: true,
                    help: "Eduzz Developer Settings"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Setup",
                    description: `Use URL: \`${url}\``,
                    action: { label: "Go to Eduzz", url: "https://orbita.eduzz.com/producer" }
                }
            ]
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        return { ok: true }; // Stub
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        return []; // Stub
    }
}
