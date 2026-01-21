
import {
    LayoutDashboard,
    User,
    Calendar,
    Banknote,
    Globe,
    ShieldCheck,
    Zap,
    Smartphone,
    CheckCircle2,
    BarChart3,
    Lock,
    ArrowRight
} from "lucide-react";

export const landingContent = {
    nav: {
        logo: "RevenueOS",
        links: [
            { label: "Produto", href: "#produto" },
            { label: "Integrações", href: "#integracoes" },
            { label: "IA Copilot", href: "#ia" },
            { label: "Segurança", href: "#seguranca" },
            { label: "Preços", href: "#precos" },
            { label: "FAQ", href: "#faq" },
        ],
        ctaPrimary: { label: "Começar grátis", href: "/signup" },
        ctaSecondary: { label: "Agendar demo", href: "/demo" }, // Placeholder link
    },
    hero: {
        headline: "Recebíveis sob controle. Receita previsível. Sem planilhas.",
        subheadline: "RevenueOS conecta Stripe, Hotmart e Asaas, normaliza tudo por projeto e mostra em tempo real: quanto vendeu, quanto entrou, quanto falta entrar — e quem está virando inadimplente.",
        bullets: [
            "Calendário de parcelas + alertas preventivos",
            "Reconciliação: por que o número bate (raw → normalized → aplicado)",
            "Copilot determinístico: Top 3 ações da semana (GPT opcional)"
        ],
        ctaPrimary: { label: "Começar grátis", href: "/signup" },
        ctaSecondary: { label: "Ver demo", href: "#demo" },
        dashboardImage: "/dashboard-preview.png"
    },
    trust: {
        title: "Feito para operações que vendem em múltiplos canais",
        badges: [
            { icon: ShieldCheck, label: "RLS + Audit Logs" },
            { icon: Lock, label: "Idempotência & Webhooks assinados" },
            { icon: User, label: "LGPD-ready (PII masking)" }
        ]
    },
    problems: {
        title: "O que quebra o caixa não é vender. É não enxergar o recebimento.",
        cards: [
            {
                icon: Globe,
                title: "Venda Espalhada",
                description: "Hotmart para infoproduto, Asaas para boleto, Stripe internacional. Seu dinheiro está em três lugares diferentes e nenhuma planilha bate."
            },
            {
                icon: Lock,
                title: "Parcelas Invisíveis",
                description: "Vendeu em 12x? Ótimo. Mas você só descobre que a parcela 3 atrasou quando o caixa aperta no mês seguinte. O controle manual falhou."
            },
            {
                icon: ShieldCheck,
                title: "Operação no Escuro",
                description: "Seu time financeiro atualiza o status no WhatsApp. Ninguém confia no número final. Auditoria é impossível e a escala vira caos."
            }
        ]
    },
    howItWorks: {
        title: "Conectar → Normalizar → Operar",
        subtitle: "Transformamos eventos brutos de qualquer gateway em inteligência financeira padronizada.",
        steps: [
            {
                number: "1",
                title: "Conecte suas fontes",
                description: "Integração nativa com Stripe, Hotmart e Asaas. Basta conectar a conta e nós puxamos o histórico."
            },
            {
                number: "2",
                title: "Camada de Verdade",
                description: "RevenueOS normaliza tudo. Uma venda é uma venda, não importa se veio do PIX ou do Cartão Internacional."
            },
            {
                number: "3",
                title: "Dash + Ações",
                description: "Receba alertas de inadimplência, visualize o calendário de recebimentos e renegocie com um clique."
            }
        ],
        microcopy: "Em minutos você vê o histórico; em dias automatiza cobrança."
    },
    dataTruth: {
        title: "Por que você confia no número",
        description: "Data Truth Layer garante que cada centavo seja rastreado desde a origem.",
        bullets: [
            "Webhook bruto armazenado (Raw Layer)",
            "Normalização para evento canônico (Normalized Layer)",
            "Aplicação no domínio: orders/payments/installments (Applied Layer)",
            "Reconciliação visual: delta, falhas e replay automático"
        ],
        cta: { label: "Ver reconciliação", href: "#produto" } // Linkando para produto por enquanto
    },
    features: {
        title: "Tudo o que você precisa para operar receita",
        subtitle: "Uma visão consolidada, quebrada por projeto.",
        blocks: [
            {
                title: "Operação por Projeto",
                items: [
                    { icon: LayoutDashboard, title: "Projetos (Centro de Tudo)", desc: "Produtos, vendas e pagamentos isolados por lançamento ou área de negócio." },
                    { icon: LayoutDashboard, title: "Visão Consolidada", desc: "Dashboards financeiros que cruzam dados de múltiplas fontes em tempo real." }
                ]
            },
            {
                title: "Recebíveis e Inadimplência",
                items: [
                    { icon: Calendar, title: "Calendário de Parcelas", desc: "Controle total de vencimentos futuro e passado." },
                    { icon: Banknote, title: "Renegociação Inteligente", desc: "Refinancie parcelas mantendo o histórico original intacto (Audit Trail)." },
                    { icon: BarChart3, title: "Aging Buckets", desc: "Visualize a dívida por idade (30/60/90 dias) e aja rápido." }
                ]
            },
            {
                title: "Transparência e Auditoria",
                items: [
                    { icon: Globe, title: "Portal do Cliente", desc: "Área read-only para seu cliente ver faturas e status. Transparência total." },
                    { icon: ShieldCheck, title: "Ops & Auditoria", desc: "Webhooks, replay de eventos, logs imutáveis e rastreabilidade ponta a ponta." }
                ]
            }
        ]
    },
    integrations: {
        title: "Integrações Tier 1 + Base para Escalar",
        tier1: [
            {
                name: "Stripe",
                logo: "/stripe-logo.png", // Usando texto estilizado na page se img falhar, mas aqui ref
                tags: ["Billing", "Webhooks", "Conciliação"],
                color: "text-[#635BFF]",
                isImage: false, // Flag para controle de render
                textLogo: "stripe"
            },
            {
                name: "Hotmart",
                logo: "/hotmart-logo.svg",
                tags: ["Vendas", "Comissões", "Cancelamento"],
                isImage: true
            },
            {
                name: "Asaas",
                logo: "/asaas-logo.svg",
                tags: ["PIX", "Boleto", "Status"],
                isImage: true
            }
        ],
        roadmap: "Kiwify, Eduzz, Lastlink, Mercado Pago, PagSeguro",
        techProof: "Connector SDK / Contract Tests incluídos."
    },
    copilot: {
        headline: "Copilot determinístico: decisões por regra, linguagem por IA.",
        description: "Não alucinamos com seu dinheiro. O motor de decisão é puramente lógico (código); a IA apenas explica o resultado.",
        columns: [
            {
                title: "Determinístico (Core)",
                items: ["Scores de Saúde", "Views SQL Otimizadas", "Regras de Cobrança", "Fila de Ações"]
            },
            {
                title: "GPT-4 (Opcional - Camada de UX)",
                items: ["Explicação de cenários", "Resumo de Dívida", "Sugestão de Copy para Cobrança", "Não altera dados"]
            }
        ],
        subfeatures: [
            { icon: Smartphone, title: "Wizard de Cadastro", desc: "State-machine guiada para criar projetos e parcelas sem erro humano." },
            { icon: ShieldCheck, title: "Analista de Risco", desc: "Identifica padrões e sugere as Top 3 ações para recuperar caixa na semana." }
        ],
        disclaimer: "Sem GPT, o Copilot usa templates determinísticos seguros."
    },
    pricing: {
        title: "Planos para o tamanho da sua operação",
        subtitle: "Sem % sobre transação. Você paga por volume de eventos mensais.",
        plans: [
            {
                name: "Starter",
                desc: "Para quem está validando.",
                price: "R$ 397",
                period: "/mês",
                cta: "Começar grátis",
                ctaLink: "/signup",
                ctaVariant: "outline",
                features: ["1 Projeto", "Até 1.000 eventos/mês", "Dashboards financeiros", "Suporte por Email"]
            },
            {
                name: "Pro",
                desc: "Para operações em escala.",
                price: "R$ 697",
                period: "/mês",
                cta: "Agendar demo",
                ctaLink: "/demo",
                ctaVariant: "primary", // Custom logic needed
                highlight: "Recomendado",
                features: ["Projetos Ilimitados", "Até 10.000 eventos/mês", "IA Copilot Completa", "Portal do Cliente", "Reconciliação Avançada", "Suporte Prioritário"]
            },
            {
                name: "Enterprise",
                desc: "Volume massivo e White-label.",
                price: "Sob Consulta",
                period: "",
                cta: "Falar com Especialista",
                ctaLink: "/contact",
                ctaVariant: "outline",
                features: ["Eventos Ilimitados", "White-label (Custom)", "SLA & Suporte Dedicado", "Compliance Avançado", "Gerente de Conta"]
            }
        ],
        comparison: [
            { feature: "Projetos", starter: "1", pro: "Ilimitados", ent: "Ilimitados" },
            { feature: "Eventos/mês", starter: "1.000", pro: "10.000", ent: "Ilimitados" },
            { feature: "Portal do Cliente", starter: "-", pro: "Sim", ent: "Sim (White-label)" },
            { feature: "Reconciliation", starter: "Básico", pro: "Avançado", ent: "Custom" },
            { feature: "IA Copilot", starter: "-", pro: "Sim", ent: "Sim" }
        ]
    },
    faq: {
        title: "Perguntas Frequentes",
        questions: [
            { q: "O RevenueOS substitui meu gateway (Stripe/Asaas)?", a: "Não. Nós nos conectamos a eles para ler os dados e centralizar a inteligência. O pagamento continua passando por onde você já confia." },
            { q: "Consigo ver parcelas e inadimplência por projeto?", a: "Sim. Essa é a nossa especialidade. Você cria projetos (lançamentos ou produtos) e o sistema isola as finanças de cada um." },
            { q: "Dá para renegociar sem perder histórico?", a: "Sim. O RevenueOS mantém a dívida original 'congelada' e cria um novo acordo, mantendo o rastro completo da auditoria." },
            { q: "O que é ‘evento’ no metering?", a: "Qualquer transação processada: uma venda, um pagamento de parcela, um estorno. Se você tem 500 vendas em 12x, o volume de eventos cresce conforme as parcelas caem." },
            { q: "Vocês movem dinheiro?", a: "Não. O RevenueOS é uma camada de inteligência e leitura (Read/Write apenas dados, não assets). Seu dinheiro fica na sua conta Stripe/Asaas." },
            { q: "Como funciona o acesso do meu cliente no portal?", a: "Você gera um link seguro (magic link) e ele acessa uma área restrita para ver faturas em aberto, 2ª via e extrato de pagamentos." }
        ]
    },
    security: {
        title: "Segurança de nível bancário",
        subtitle: "Proteção total para seus dados e conformidade para sua operação.",
        cards: [
            { icon: ShieldCheck, title: "Row-Level Security (RLS)", description: "Isolamento absoluto de dados. Mesmo em nível de banco de dados, um tenant nunca acessa dados de outro." },
            { icon: Lock, title: "Criptografia & PII", description: "Dados sensíveis são criptografados em repouso e em trânsito. Conformidade total com LGPD." },
            { icon: Globe, title: "Audit Logs Imutáveis", description: "Cada ação no sistema gera um rastro de auditoria permanente. Saiba exatamente quem fez o quê." }
        ]
    },
    finalCta: {
        headline: "Você não precisa vender mais. Precisa receber melhor.",
        sub: "Se hoje você depende de planilha e 'sensação', a próxima inadimplência vai te lembrar.",
        ctaPrimary: { label: "Começar grátis", href: "/signup" },
        ctaSecondary: { label: "Agendar demo", href: "/demo" }
    },
    footer: {
        copyright: "© 2026 Antigravity. Todos os direitos reservados."
    }
};
