
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class MercadoPagoConnector extends BaseConnectorV2 {
    providerKey = "mercadopago";
    displayName = "Mercado Pago";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: true,
        subscriptions: true,
        payouts: true,
        disputes: true,
        refunds: true,
        installments: true,
        commissions: false,
        affiliates: false,
        multi_currency: true
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'hmac_signature',
            recommendedEvents: [{ code: 'payment.created', label: 'Pgmto Criado' }],
            fields: [
                {
                    key: "access_token",
                    label: "Access Token",
                    type: "password",
                    required: true,
                    help: "MP Developers"
                }
            ],
            instructions: [
                {
                    step: 1,
                    title: "Setup",
                    description: `Use URL: \`${url}\``,
                    action: { label: "Go to MP", url: "https://www.mercadopago.com.br/developers" }
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
