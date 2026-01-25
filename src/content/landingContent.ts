import {
    LayoutDashboard,
    User,
    Calendar,
    Banknote,
    Globe,
    ShieldCheck,
    Zap,
    Smartphone,
    Lock,
    BarChart3
} from "lucide-react";

export const landingContent = {
    nav: {
        logo: "RevenueOS",
        links: [
            { label: "Produto", href: "/#produto" },
            { label: "Integrações", href: "/#integracoes" },
            { label: "IA Copilot", href: "/#ia" },
            { label: "Segurança", href: "/#seguranca" },
            { label: "Preços", href: "/#precos" },
            { label: "Blog", href: "/blog" },
            { label: "Recursos", href: "/recursos" },
            { label: "Ajuda", href: "/ajuda" },
        ],
        ctaPrimary: { label: "Começar agora", href: "/signup" },
        ctaSecondary: { label: "Login", href: "/login" },
    },
    hero: {
        pill: "Novo: Data Truth Layer",
        headline: "Recebíveis sob controle. Receita previsível. Sem planilhas.",
        subheadline: "RevenueOS conecta Stripe, Hotmart e Asaas, normaliza tudo por projeto e mostra em tempo real: quanto vendeu, quanto entrou, quanto falta entrar — e quem está virando inadimplente.",
        bullets: [
            "Calendário de parcelas + alertas preventivos",
            "Reconciliação: por que o número bate (raw → normalized → aplicado)",
            "Copilot determinístico: Top 3 ações da semana (GPT opcional)"
        ],
        ctaPrimary: { label: "Comece agora", href: "/signup" },
        ctaSecondary: { label: "Ver demo", href: "/demo" },
        microtrust: [
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
    ttv: {
        title: "Como fica em 7 dias",
        steps: [
            {
                title: "Dia 1: Conexão",
                description: "Integramos seus gateways (Stripe, Hotmart, Asaas) e importamos o histórico de vendas bruto."
            },
            {
                title: "Dia 3: Normalização",
                description: "A Data Truth Layer organiza cada centavo por projeto, aplicando taxas e convertendo moedas."
            },
            {
                title: "Dia 7: Automação",
                description: "Seu calendário de recebíveis está pronto e o Copilot sugere as ações de cobrança prioritárias."
            }
        ]
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
        cta: { label: "Ver reconciliação", href: "#seguranca" }
    },
    features: {
        title: "Tudo o que você precisa para operar receita",
        subtitle: "Uma visão consolidada, quebrada por projeto.",
        blocks: [
            {
                title: "Operação por Projeto",
                items: [
                    { icon: LayoutDashboard, title: "Projetos (Visão consolidada)", desc: "Produtos, vendas e pagamentos isolados por lançamento ou área de negócio." }
                ]
            },
            {
                title: "Recebíveis e inadimplência",
                items: [
                    { icon: Calendar, title: "Calendário de Parcelas", desc: "Controle total de vencimentos futuro e passado." },
                    { icon: Banknote, title: "Renegociação Inteligente", desc: "Refinancie parcelas mantendo o histórico original intacto (Audit Trail)." },
                    { icon: BarChart3, title: "Aging Buckets", desc: "Visualize a dívida por idade (30/60/90 dias) e aja rápido." }
                ]
            },
            {
                title: "Transparência e auditoria",
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
            { name: "Stripe", logo: "/logos/stripe.png", tags: ["Billing", "Webhooks"], isImage: true },
            { name: "Hotmart", logo: "/logos/hotmart.png", tags: ["Infoproduto"], isImage: true },
            { name: "Asaas", logo: "/logos/asaas.png", tags: ["Boleto/PIX"], isImage: true, className: "h-12 md:h-16 max-w-[140px]" },
            { name: "Mercado Pago", logo: "/logos/mercadopago.png", tags: ["Checkout"], isImage: true },
            { name: "Kiwify", logo: "/logos/kiwify.png", tags: ["Checkout"], isImage: true, className: "h-12 md:h-16 max-w-[140px]" },
            { name: "Eduzz", logo: "/logos/eduzz.png", tags: ["Lançamentos"], isImage: true },
            { name: "Lastlink", logo: "/logos/lastlink.png", tags: ["Comunidade"], isImage: true },
            { name: "PagSeguro", logo: "/logos/pagseguro.png", tags: ["Gateway"], isImage: true }
        ],
        techProof: "Connector SDK / Contract Tests incluídos."
    },
    copilot: {
        title: "Copilot determinístico: decisões por regra, linguagem por IA.",
        description: "Não alucinamos com seu dinheiro. O motor de decisão é puramente lógico (código); a IA apenas explica o resultado.",
        columns: [
            {
                title: "Determinístico (Core)",
                items: ["Scores de Saúde", "Views SQL Otimizadas", "Regras de Cobrança", "Fila de Ações"]
            },
            {
                title: "GPT (Opcional - Camada de UX)",
                items: ["Explicação de cenários", "Resumo de Dívida", "Sugestão de Copy para Cobrança", "Não altera dados"]
            }
        ],
        subfeatures: [
            { icon: Smartphone, title: "Wizard de Cadastro", desc: "State-machine guiada para criar projetos e parcelas sem erro humano." },
            { icon: ShieldCheck, title: "Analista de Risco", desc: "Identifica padrões e sugere as Top 3 ações para recuperar caixa na semana." }
        ],
        disclaimer: "Sem GPT, o Copilot usa templates determinísticos seguros."
    },
    security: {
        title: "Segurança de nível bancário",
        cards: [
            { icon: ShieldCheck, title: "RLS", description: "Row-Level Security garante que um tenant nunca acesse dados de outro." },
            { icon: Lock, title: "Criptografia & PII", description: "Dados sensíveis criptografados e mascaramento de PII (Compliance LGPD)." },
            { icon: Globe, title: "Audit Logs", description: "Cada ação gera um rastro de auditoria permanente e imutável." }
        ]
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
                cta: "Iniciar Starter",
                ctaLink: "/signup",
                ctaVariant: "outline",
                features: ["1 Projeto", "Até 1.000 eventos/mês", "Dashboards financeiros", "Suporte por Email"]
            },
            {
                name: "Pro",
                desc: "Para operações em escala.",
                price: "R$ 697",
                period: "/mês",
                cta: "Assinar Pro",
                ctaLink: "/signup",
                ctaVariant: "default",
                highlight: "Recomendado",
                features: ["Projetos Ilimitados", "Até 10.000 eventos/mês", "IA Copilot Completa", "Portal do Cliente", "Reconciliação Avançada"]
            },
            {
                name: "Enterprise",
                desc: "Volume massivo e White-label.",
                price: "Sob Consulta",
                period: "",
                cta: "Contatar Vendas",
                ctaLink: "/signup",
                ctaVariant: "outline",
                features: ["Eventos Ilimitados", "White-label (Custom)", "SLA & Suporte Dedicado", "Gerente de Conta"]
            }
        ],
        comparison: [
            { feature: "Organizations System", starter: "1 org", pro: "Unlimited", ent: "Unlimited + White-label" },
            { feature: "Projects", starter: "5 projects", pro: "Unlimited", ent: "Unlimited" },
            { feature: "IA Copilot", starter: "-", pro: "✓ Top 3 actions", ent: "✓ Unlimited" },
            { feature: "Security", starter: "RLS + LGPD", pro: "All + SOC2", ent: "All + Custom" },
        ]
    },
    faq: {
        title: "Perguntas Frequentes",
        questions: [
            { q: "Preciso de GPT para usar?", a: "Não. GPT é opcional; o Copilot é determinístico. A IA só resume/explica o resultado lógico." },
            { q: "O RevenueOS substitui meu gateway?", a: "Não. Nós nos conectamos a eles para ler os dados e centralizar a inteligência." },
            { q: "Como funciona a integração?", a: "Via API ou Webhooks oficiais. Conectamos com um clique no Stripe, Hotmart e Asaas para importar dados históricos e tempo real." },
            { q: "Posso testar antes de assinar?", a: "Sim, oferecemos uma demo guiada e um período de trial para operações que atendam aos requisitos mínimos de volume." },
            { q: "Quais gateways são suportados?", a: "Stripe, Hotmart, Asaas, Mercado Pago, Kiwify, Eduzz, Lastlink e PagSeguro." },
            { q: "Consigo ver parcelas e inadimplência por projeto?", a: "Sim. Essa é a nossa especialidade: visibilidade granular por projeto para que seu caixa nunca seja uma surpresa." },
            { q: "Vocês movem dinheiro?", a: "Não. O RevenueOS é uma camada de inteligência e leitura. Seu dinheiro fica na sua conta gateway; nós apenas organizamos a visão." }
        ]
    },
    finalCta: {
        title: "Você não precisa vender mais. Precisa receber melhor.",
        subtitle: "Se hoje você depende de planilha e 'sensação', a próxima inadimplência vai te lembrar.",
        buttons: [
            { label: "Começar agora", href: "/signup", primary: true },
            { label: "Agendar demo", href: "/demo", primary: false }
        ]
    },
    footer: {
        copyright: "© 2026 RevenueOS. Todos os direitos reservados."
    }
};
