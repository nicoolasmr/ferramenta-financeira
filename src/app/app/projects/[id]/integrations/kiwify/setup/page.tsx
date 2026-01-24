
import { IntegrationSetupCard } from "@/components/integrations/IntegrationSetupCard";
import { getWebhookUrl } from "@/lib/integrations/setup";

export default async function KiwifySetupPage({ params }: { params: { id: string } }) {
    const webhookUrl = await getWebhookUrl(params.id, "kiwify");

    return (
        <IntegrationSetupCard
            provider="kiwify"
            providerName="Kiwify"
            projectId={params.id}
            webhookUrl={webhookUrl}
            credentialFields={[
                {
                    key: "webhook_token",
                    label: "Webhook Token (Signature/Token)",
                    placeholder: "Retrieve from Kiwify settings",
                    required: true,
                    type: "password"
                },
                {
                    key: "client_id",
                    label: "Client ID (Optional for Backfill)",
                    placeholder: "Available in API settings",
                }
            ]}
            steps={[
                {
                    title: "Create Webhook",
                    description: "In Kiwify: Apps -> Webhooks -> Create New.",
                    action: { label: "Go to Kiwify", url: "https://dashboard.kiwify.com.br/apps/webhooks" }
                },
                {
                    title: "Paste URL",
                    description: "Use the Webhook URL provided above.",
                },
                {
                    title: "Select Events",
                    description: "Select: 'Compra aprovada', 'Reembolso', 'Chargeback'.",
                },
                {
                    title: "Copy Token",
                    description: "Copy the token shown after creation and paste it here.",
                }
            ]}
        />
    );
}
