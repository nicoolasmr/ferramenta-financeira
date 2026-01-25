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
            "Go to Kiwify → Apps → Webhooks",
            "Create new webhook",
            "Paste the webhook URL shown below",
            "Select events: Order Approved, Refunded",
            "Save and copy the Signature Token"
        ],
        docsUrl: "https://kiwify.com.br/ajuda"
    },
    mercadopago: {
        title: "Configure Mercado Pago Webhook",
        description: "Receive payment notifications from Mercado Pago",
        steps: [
            "Go to Mercado Pago Developers → Your Integrations",
            "Select your application",
            "Webhooks notifications",
            "Add Production URL",
            "Paste the webhook URL shown below"
        ],
        docsUrl: "https://www.mercadopago.com.br/developers"
    },
    belvo: {
        title: "Configure Belvo Webhook",
        description: "Receive Open Finance transaction updates",
        steps: [
            "Go to Belvo Dashboard → Developers → Webhooks",
            "Add subscription",
            "Paste the webhook URL",
            "Select 'transactions.check' and 'accounts.check'"
        ],
        docsUrl: "https://docs.belvo.com/"
    },
    lastlink: {
        title: "Configure Lastlink",
        description: "Receive sale notifications",
        steps: [
            "Go to Lastlink Dashboard",
            "Paste the webhook URL"
        ],
        docsUrl: "https://lastlink.com/developers"
    },
    monetizze: {
        title: "Configure Monetizze",
        description: "Receive events from Monetizze",
        steps: ["Paste the webhook URL in Monetizze Tools"],
        docsUrl: "https://ajuda.monetizze.com.br/"
    },
    pagseguro: {
        title: "Configure PagSeguro",
        description: "Receive notifications from PagSeguro",
        steps: ["Configure Notification URL in PagSeguro"],
        docsUrl: "https://dev.pagseguro.uol.com.br/"
    }
} as const;

export type WebhookProvider = keyof typeof WEBHOOK_INSTRUCTIONS;
