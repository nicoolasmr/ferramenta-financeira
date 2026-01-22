
import { LucideIcon } from "lucide-react";

export type IntegrationMode = "oauth" | "api_key" | "webhook_only";

export interface IntegrationField {
    key: string;
    label: string;
    type: "text" | "password";
    placeholder?: string;
    helperText?: string;
    required: boolean;
}

export interface SetupStep {
    title: string;
    description: string;
    fields?: IntegrationField[];
    hasWebhookUrl?: boolean;
    hasWebhookToken?: boolean;
    // New fields for rich UI
    checklist?: string[];
    alert?: { type: "info" | "warning"; text: string };
}

export interface ProviderSpec {
    id: string;
    name: string;
    description: string;
    modes: IntegrationMode[];
    defaultMode: IntegrationMode;
    logo: string;
    docsUrl: string;
    steps: SetupStep[];
    features: string[];
}

export const PROVIDERS: Record<string, ProviderSpec> = {
    stripe: {
        id: "stripe",
        name: "Stripe",
        description: "Conecte sua conta Stripe para importar vendas, assinaturas e acompanhar recebimentos em tempo real.",
        modes: ["oauth", "api_key"],
        defaultMode: "oauth",
        logo: "/logos/stripe.png",
        docsUrl: "/help/integrations/stripe",
        features: ["Pagamentos", "Assinaturas", "Reembolsos", "Webhooks"],
        steps: [
            {
                title: "Visão Geral",
                description: "Conexão em 1 clique (recomendado). Você vai autorizar o RevenueOS a ler seus dados financeiros.",
                checklist: [
                    "Sem copiar/colar chaves secretas",
                    "Você pode revogar o acesso a qualquer momento",
                    "Importa pagamentos, assinaturas e reembolsos"
                ],
                alert: { type: "info", text: "🔒 Segurança: nós nunca exibimos suas chaves depois de salvar." }
            },
            {
                title: "Conectar",
                description: "Você será redirecionado para o Stripe. Faça login e clique em 'Autorizar'.",
                fields: [], // OAuth
            },
            {
                title: "Webhooks",
                description: "Para a integração ficar 'saudável', o RevenueOS precisa receber eventos do Stripe.",
                hasWebhookUrl: true,
                alert: { type: "warning", text: "Se você não configurar webhook, a importação pode ficar atrasada." }
            },
            {
                title: "Testar & Confirmar",
                description: "Vamos validar se o acesso está ativo e se conseguimos ler dados da sua conta.",
            }
        ]
    },
    asaas: {
        id: "asaas",
        name: "Asaas",
        description: "Conecte sua conta Asaas para importar cobranças (PIX, boleto, cartão) e acompanhar inadimplência.",
        modes: ["api_key"],
        defaultMode: "api_key",
        logo: "/logos/asaas.png",
        docsUrl: "/help/integrations/asaas",
        features: ["Cobranças", "PIX", "Boletos", "Cartão"],
        steps: [
            {
                title: "Visão Geral",
                description: "Você vai gerar uma API Key no Asaas e colar aqui. Depois vamos configurar um webhook.",
                checklist: [
                    "Você tem acesso de administrador no Asaas",
                    "Você pode criar/editar webhooks"
                ],
                alert: { type: "warning", text: "🔒 Segurança: trate a API Key como senha. Não compartilhe em grupos." }
            },
            {
                title: "Conectar",
                description: "Cole aqui sua API Key do Asaas.",
                fields: [
                    {
                        key: "api_key",
                        label: "API Key",
                        type: "password",
                        placeholder: "Cole aqui sua API Key do Asaas",
                        helperText: "No painel do Asaas, procure por: 'Integrações' → 'API' → 'Chaves/Token'.",
                        required: true
                    }
                ]
            },
            {
                title: "Webhooks",
                description: "Sem webhook, seus dados podem ficar desatualizados.",
                hasWebhookUrl: true,
                hasWebhookToken: true,
                alert: { type: "info", text: "O RevenueOS valida o token recebido para garantir que o evento veio do Asaas." }
            },
            {
                title: "Testar & Confirmar",
                description: "Vamos validar se a API Key está correta e se conseguimos receber eventos.",
            }
        ]
    },
    mercadopago: {
        id: "mercadopago",
        name: "Mercado Pago",
        description: "Conecte o Mercado Pago para importar pagamentos e acompanhar status (aprovado, recusado, estornado).",
        modes: ["oauth", "api_key"],
        defaultMode: "oauth",
        logo: "/logos/mercadopago.png",
        docsUrl: "/help/integrations/mercadopago",
        features: ["Pagamentos", "Status em tempo real"],
        steps: [
            {
                title: "Visão Geral",
                description: "Recomendamos conexão por autorização (OAuth) para reduzir risco e facilitar manutenção.",
                checklist: [
                    "Sem copiar/colar chaves secretas",
                    "Renovação e permissões controladas",
                    "Mais seguro para SaaS"
                ]
            },
            {
                title: "Conectar",
                description: "Você será redirecionado para autorizar. Depois voltará automaticamente para o RevenueOS.",
                fields: [
                    {
                        key: "public_key",
                        label: "Public Key (Opcional)",
                        type: "text",
                        placeholder: "APP_USR-...",
                        helperText: "Apenas se usar modo manual.",
                        required: false
                    },
                    {
                        key: "access_token",
                        label: "Access Token (Opcional)",
                        type: "password",
                        placeholder: "APP_USR-...",
                        helperText: "Apenas se usar modo manual.",
                        required: false
                    }
                ]
            },
            {
                title: "Notificações",
                description: "Para atualizar status automaticamente, configure notificações apontando para o RevenueOS.",
                hasWebhookUrl: true,
            },
            {
                title: "Testar & Confirmar",
                description: "Se não houver evento de teste, realize uma transação pequena no sandbox/teste.",
            }
        ]
    },
    eduzz: {
        id: "eduzz",
        name: "Eduzz",
        description: "Conecte a Eduzz para importar vendas, reembolsos e status de pagamento.",
        modes: ["oauth", "api_key"],
        defaultMode: "oauth",
        logo: "/logos/eduzz.png",
        docsUrl: "/help/integrations/eduzz",
        features: ["Vendas", "Reembolsos", "Parcelamentos"],
        steps: [
            {
                title: "Visão Geral",
                description: "Conecte para trazer automaticamente vendas, cancelamentos e formas de pagamento.",
                checklist: [
                    "Vendas aprovadas e pendentes",
                    "Cancelamentos/reembolsos",
                    "Formas de pagamento e parcelamentos"
                ]
            },
            {
                title: "Conectar",
                description: "Você autoriza o RevenueOS a ler seus dados e voltamos automaticamente.",
                fields: [
                    {
                        key: "public_key",
                        label: "Public Key (Manual)",
                        type: "text",
                        placeholder: "...",
                        helperText: "Modo manual apenas.",
                        required: false
                    },
                    {
                        key: "api_key",
                        label: "API Key (Manual)",
                        type: "password",
                        placeholder: "...",
                        helperText: "⚠️ Algumas plataformas mostram a API Key apenas uma vez ao gerar.",
                        required: false
                    }
                ]
            },
            {
                title: "Webhooks",
                description: "Configure o webhook para receber atualizações instantâneas.",
                hasWebhookUrl: true,
                hasWebhookToken: true,
            },
            {
                title: "Testar & Confirmar",
                description: "Se não houver evento de teste, faça uma venda em ambiente de teste ou aguarde a próxima venda real.",
            }
        ]
    },
    hotmart: {
        id: "hotmart",
        name: "Hotmart",
        description: "Conecte a Hotmart para importar vendas, comissões, reembolsos e status de pagamento.",
        modes: ["oauth", "webhook_only"],
        defaultMode: "oauth",
        logo: "/logos/hotmart.png",
        docsUrl: "/help/integrations/hotmart",
        features: ["Vendas", "Comissões", "Status"],
        steps: [
            {
                title: "Visão Geral",
                description: "A Hotmart pode enviar eventos de venda e pagamento automaticamente via webhook.",
                checklist: [
                    "Autorizar a conexão",
                    "Configurar webhook para eventos em tempo real"
                ],
                alert: { type: "info", text: "✅ Você NÃO precisa criar 'app' nem mexer em 'client secret'. Isso é responsabilidade da plataforma." }
            },
            {
                title: "Conectar",
                description: "Você autoriza a leitura dos dados da sua conta e voltamos automaticamente.",
                fields: [
                    {
                        key: "hottok",
                        label: "Hottok (Token do Webhook)",
                        type: "text",
                        placeholder: "Cole o Hottok aqui",
                        helperText: "No painel da Hotmart, procure por 'Webhooks' e crie/edite um token (Hottok).",
                        required: false
                    }
                ]
            },
            {
                title: "Webhooks",
                description: "Agora a Hotmart precisa saber para onde enviar os eventos.",
                hasWebhookUrl: true,
                alert: { type: "info", text: "O RevenueOS valida o token para garantir que o evento veio da Hotmart." }
            },
            {
                title: "Testar & Confirmar",
                description: "Se a Hotmart tiver opção de evento de teste, use. Se não, aguarde a próxima venda.",
            }
        ]
    },
    kiwify: {
        id: "kiwify",
        name: "Kiwify",
        description: "Conecte sua conta Kiwify para importar vendas e acompanhar pagamentos automaticamente.",
        modes: ["api_key"],
        defaultMode: "api_key",
        logo: "/logos/kiwify.png",
        docsUrl: "/help/integrations/kiwify",
        features: ["Vendas", "Upsells", "Reembolsos"],
        steps: [
            {
                title: "Visão Geral",
                description: "Em poucos minutos, você conecta a Kiwify e o RevenueOS passa a importar vendas e atualizações.",
                checklist: [
                    "Acesso ao painel da Kiwify (perfil administrador)",
                    "Gerar uma credencial de API na Kiwify",
                    "Configurar um webhook apontando para o RevenueOS"
                ],
                alert: { type: "warning", text: "🔒 Segurança: essa credencial dá acesso a dados sensíveis. Não compartilhe em grupos." }
            },
            {
                title: "Conectar",
                description: "Gere suas credenciais no painel da Kiwify (Apps/Integrações/API).",
                fields: [
                    {
                        key: "account_id",
                        label: "Account ID",
                        type: "text",
                        placeholder: "Ex: 123456789",
                        helperText: "Você encontra o 'Account ID' na área de credenciais/API.",
                        required: true
                    },
                    {
                        key: "client_secret",
                        label: "Client Secret",
                        type: "password",
                        placeholder: "Cole aqui seu Client Secret",
                        helperText: "Esse segredo funciona como uma senha. O RevenueOS armazena criptografado.",
                        required: true
                    }
                ]
            },
            {
                title: "Webhooks",
                description: "Ative atualização em tempo real configurando a URL abaixo.",
                hasWebhookUrl: true,
                hasWebhookToken: true,
                alert: { type: "info", text: "Sem webhook, seus dados podem demorar para atualizar e o Copilot marca a integração como 'Stale'." }
            },
            {
                title: "Testar & Confirmar",
                description: "Vamos verificar se o RevenueOS consegue acessar sua conta com as credenciais informadas.",
            }
        ]
    },
    lastlink: {
        id: "lastlink",
        name: "Lastlink",
        description: "Conecte a Lastlink para receber eventos de vendas e pagamentos automaticamente.",
        modes: ["webhook_only"],
        defaultMode: "webhook_only",
        logo: "/logos/lastlink.png",
        docsUrl: "/help/integrations/lastlink",
        features: ["Vendas", "Assinaturas"],
        steps: [
            {
                title: "Visão Geral",
                description: "Integração rápida via Webhook. Você NÃO precisa colar API Key aqui.",
                checklist: [
                    "Copiar a URL do webhook do RevenueOS",
                    "Colar essa URL no painel da Lastlink",
                    "Selecionar os eventos",
                    "Testar e confirmar"
                ],
                alert: { type: "warning", text: "🔒 A URL do webhook contém um token de segurança. Não compartilhe publicamente." }
            },
            {
                title: "Conectar",
                description: "Você só precisa configurar o endpoint na Lastlink. O RevenueOS reconhece e valida os eventos automaticamente.",
                fields: []
            },
            {
                title: "Webhooks",
                description: "Copie a URL abaixo e crie um Webhook na Lastlink.",
                hasWebhookUrl: true,
                alert: { type: "info", text: "O token de segurança já está embutido na URL." }
            },
            {
                title: "Testar & Confirmar",
                description: "Clique em 'Testar' no painel da Lastlink (se existir) ou aguarde um evento real.",
            }
        ]
    }
};
