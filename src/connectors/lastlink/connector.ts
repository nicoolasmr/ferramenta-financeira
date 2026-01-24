
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class LastlinkConnector extends BaseConnectorV2 {
    providerKey = "lastlink";
    displayName = "Lastlink";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: false,
        subscriptions: true,
        payouts: false,
        disputes: false,
        refunds: true,
        installments: false,
        commissions: false,
        affiliates: false,
        multi_currency: false
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'none', // Lastlink relies on Secret URL usually or basic auth? Assuming none for MVP Stub
            recommendedEvents: [],
            fields: [
                {
                    key: "secret",
                    label: "Webhook Secret",
                    type: "password",
                    required: true,
                    help: "Secret provided by Lastlink"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Setup",
                    description: `Use URL: \`${url}\``,
                    action: { label: "Go to Lastlink", url: "https://lastlink.com" }
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
