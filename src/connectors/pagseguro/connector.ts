
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class PagSeguroConnector extends BaseConnectorV2 {
    providerKey = "pagseguro";
    displayName = "PagSeguro";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: true,
        subscriptions: true,
        payouts: false,
        disputes: true,
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
            verificationKind: 'none',
            recommendedEvents: [],
            fields: [
                {
                    key: "token",
                    label: "Token",
                    type: "password",
                    required: true,
                    help: "PagSeguro Vendas Online"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Setup",
                    description: `Use URL: \`${url}\``,
                    action: { label: "Go to PagSeguro", url: "https://pagseguro.uol.com.br/integracao/notificacao-de-transacao" }
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
