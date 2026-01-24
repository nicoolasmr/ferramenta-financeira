
import { IntegrationSetupCard } from "@/components/integrations/IntegrationSetupCard";
import { getWebhookUrl } from "@/lib/integrations/setup";

export default async function AsaasSetupPage({ params }: { params: { id: string } }) {
    const webhookUrl = await getWebhookUrl(params.id, "asaas");

    return (
        <IntegrationSetupCard
            provider="asaas"
            providerName="Asaas"
            projectId={params.id}
            webhookUrl={webhookUrl}
            credentialFields={[
                {
                    key: "webhook_token",
                    label: "Webhook Access Token (Token de Acesso)",
                    placeholder: "Ex: $aact_Y34...",
                    required: true,
                    type: "password"
                },
                {
                    key: "api_key",
                    label: "API Key (Optional for Backfill)",
                    placeholder: "Ex: $aact_...",
                    type: "password"
                }
            ]}
            steps={[
                {
                    title: "Access Asaas Integrations",
                    description: "Go to Configurações -> Integrações in your Asaas panel.",
                    action: { label: "Go to Asaas", url: "https://www.asaas.com/customerConfigIntegration" }
                },
                {
                    title: "Configure Webhook",
                    description: "Paste the URL above into the 'Webhook para cobranças' field.",
                },
                {
                    title: "Set Access Token",
                    description: "Generate or copy the 'Token de Acesso' in Asaas and paste it here.",
                },
                {
                    title: "Activate Events",
                    description: "Check: 'Cobrança criada', 'Pagamento recebido', 'Cobrança vencida'.",
                }
            ]}
        />
    );
}
