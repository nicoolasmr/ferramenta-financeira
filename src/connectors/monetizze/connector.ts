
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class MonetizzeConnector extends BaseConnectorV2 {
    providerKey = "monetizze";
    displayName = "Monetizze";

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
        multi_currency: false
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'header_token',
            recommendedEvents: [],
            fields: [
                {
                    key: "consumer_key",
                    label: "Consumer Key",
                    type: "password",
                    required: true,
                    help: "Monetizze API"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Setup",
                    description: `Use URL: \`${url}\``,
                    action: { label: "Go to Monetizze", url: "https://app.monetizze.com.br/ferramentas/postback" }
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
