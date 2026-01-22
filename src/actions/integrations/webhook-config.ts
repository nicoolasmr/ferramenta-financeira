"use server";

export function generateWebhookUrl(
    provider: string,
    orgId: string
): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.revenueos.com';
    return `${baseUrl}/api/webhooks/${provider}/${orgId}`;
}

export const WEBHOOK_INSTRUCTIONS = {
    stripe: {
        title: "Configure Stripe Webhook",
        description: "Set up webhooks to receive real-time payment events from Stripe",
        steps: [
            "Go to Stripe Dashboard → Developers → Webhooks",
            "Click 'Add endpoint'",
            "Paste the webhook URL shown below",
            "Select these events: payment_intent.succeeded, charge.refunded, customer.created, invoice.paid",
            "Click 'Add endpoint' to save"
        ],
        docsUrl: "https://stripe.com/docs/webhooks"
    },
    hotmart: {
        title: "Configure Hotmart Webhook",
        description: "Receive notifications about sales and refunds from Hotmart",
        steps: [
            "Go to Hotmart → Tools → Webhooks",
            "Click 'New Webhook' or 'Add Webhook'",
            "Paste the webhook URL shown below",
            "Select events: PURCHASE_COMPLETE, PURCHASE_REFUNDED, PURCHASE_CANCELED",
            "Save the configuration"
        ],
        docsUrl: "https://developers.hotmart.com/docs/pt-BR/v1/webhooks/"
    },
    asaas: {
        title: "Configure Asaas Webhook",
        description: "Get instant notifications for payments and charges",
        steps: [
            "Go to Asaas Dashboard → Configurações → Webhooks",
            "Click 'Adicionar Webhook'",
            "Paste the webhook URL shown below",
            "Select events: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE",
            "Click 'Salvar'"
        ],
        docsUrl: "https://docs.asaas.com/reference/webhooks"
    },
    eduzz: {
        title: "Configure Eduzz Webhook",
        description: "Receive real-time updates from Eduzz",
        steps: [
            "Go to Eduzz → Configurações → Webhooks",
            "Add new webhook",
            "Paste the webhook URL shown below",
            "Select relevant events",
            "Save configuration"
        ],
        docsUrl: "https://atendimento.eduzz.com/"
    },
    kiwify: {
        title: "Configure Kiwify Webhook",
        description: "Get notifications from Kiwify sales",
        steps: [
            "Go to Kiwify → Settings → Webhooks",
            "Add webhook",
            "Paste the webhook URL shown below",
            "Select events",
            "Save"
        ],
        docsUrl: "https://kiwify.com.br/ajuda"
    }
} as const;

export type WebhookProvider = keyof typeof WEBHOOK_INSTRUCTIONS;
