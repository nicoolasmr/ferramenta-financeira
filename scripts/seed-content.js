
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), 'content/blog');
const HELP_DIR = path.join(process.cwd(), 'content/help');

const BLOG_CATEGORIES = [
    "Receita Previsível", "Gestão Financeira", "Tecnologia SaaS", "Estratégia B2B"
];

const HELP_CATEGORIES = [
    { id: "getting-started", label: "Começando" },
    { id: "projects", label: "Projetos" },
    { id: "sales", label: "Vendas & Clientes" },
    { id: "payments", label: "Pagamentos & Recebíveis" },
    { id: "integrations", label: "Integrações" },
    { id: "copilot", label: "IA Copilot" },
    { id: "security", label: "Segurança & Permissões" },
    { id: "ops", label: "Ops & Troubleshooting" }
];

// Helper to sanitize slug
const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const BLOG_TOPICS = [
    "O Guia Definitivo da Receita Recorrente",
    "Como Reduzir o Churn Involuntário em 30%",
    "A Verdade sobre Reconciliação Financeira",
    "Por que Planilhas matam seu SaaS",
    "Webhook vs. Polling: Qual o melhor?",
    "O que é 'Event Sourcing' na prática",
    "Como auditar um processo financeiro",
    "KPIs que Investidores olham em Series A",
    "Gestão de Inadimplência com IA",
    "Stripe vs. Asaas: Comparativo 2026",
    "Como escalar operações financeiras",
    "O fim do boleto manual",
    "Segurança de dados em Fintechs",
    "Auditoria de Logs: Por que ter?",
    "LGPD para SaaS B2B",
    "Como precificar seu SaaS",
    "Modelos de Cobrança Híbrida",
    "O que é Dunning Inteligente?",
    "Dashboards Financeiros que funcionam",
    "O papel do CFO em Startups",
];

// Generate more varied titles
for (let i = 0; i < 80; i++) {
    const seeds = ["Estratégia", "Tática", "Segredo", "Erro Comum", "Futuro", "Tendência", "Análise", "Tutorial"];
    const subjects = ["de Vendas", "do Financeiro", "de Tech", "de Ops", "de Growth", "de API", "de UX"];
    BLOG_TOPICS.push(`${seeds[i % seeds.length]} ${subjects[i % subjects.length]} para SaaS de Alta Performance #${i + 1}`);
}

function generateBlogContent(title) {
    return `---
title: "${title}"
excerpt: "Descubra como aplicar ${title} na sua operação de SaaS e garantir escala sustentável."
date: "${new Date(2025, 0, 1 + Math.floor(Math.random() * 365)).toISOString()}"
category: "${BLOG_CATEGORIES[Math.floor(Math.random() * BLOG_CATEGORIES.length)]}"
tags: ["SaaS", "Finanças", "Growth"]
readingTime: "${5 + Math.floor(Math.random() * 10)} min"
author: "RevenueOS Team"
---

## Introdução

No mundo acelerado das startups, **${title}** é mais do que uma buzzword; é uma necessidade de sobrevivência. Muitos fundadores ignoram a importância de uma base sólida até que o *churn* aumente ou o caixa aperte.

Neste artigo, vamos explorar profundamente como você pode implementar estratégias vencedoras.

<Callout type="info" title="Fato Curioso">
Estudos mostram que 70% dos erros financeiros em escala vêm de processos manuais mal definidos no early-stage.
</Callout>

## O Problema das Planilhas

Você provavelmente começou com uma planilha no Excel ou Google Sheets. Funciona para os primeiros 10 clientes. Mas e quando você tem 1.000? A complexidade cresce exponencialmente.

### Sinais de que você precisa evoluir:
1.  Seus dados não batem entre o Gateway e o Banco.
2.  Você gasta mais de 5 horas por semana conciliando contas.
3.  Você não sabe quem está inadimplente em tempo real.

## A Solução: Automação Inteligente

A chave para resolver isso não é contratar mais pessoas, mas sim implementar tecnologia. O RevenueOS atua exatamente nessa lacuna.

### Case de Sucesso

Imagine uma empresa que reduziu seu tempo de fechamento de 5 dias para 5 minutos. Isso é possível quando você tem uma *"Data Truth Layer"* confiável.

<ScreenshotFrame alt="Dashboard Financeiro do RevenueOS mostrando métricas de MRR e Churn em tempo real" caption="Dashboard Unificado: A verdade sobre sua receita em uma única tela." />

## Passo a Passo para Implementar

1.  **Audite suas fontes de dados**: Liste todos os gateways (Stripe, Hotmart, Asaas).
2.  **Centralize a ingestão**: Use webhooks para capturar eventos em tempo real.
3.  **Normalize**: Transforme JSONs diferentes em um modelo canônico.
4.  **Concilie**: Automatize a verificação de "quem pagou o quê".

## Conclusão

Não deixe que a complexidade financeira freie seu crescimento. **${title}** é o primeiro passo para maturidade operacional.

<CTABox title="Quer aplicar isso hoje?" subtitle="O RevenueOS conecta suas pontas financeiras em minutos." />
`;
}

function generateHelpContent(title, category) {
    return `---
title: "${title}"
excerpt: "Passo a passo completo sobre como configurar e usar ${title} no RevenueOS."
updatedAt: "2026-02-21"
category: "${category.label}"
keywords: ["${category.id}", "tutorial", "setup"]
---

## O que é?

**${title}** é uma funcionalidade essencial para quem busca controle total sobre a operação. Nesta seção, explicaremos como configurá-la corretamente.

<Callout type="warning" title="Atenção">
Certifique-se de ter permissões de *Admin* ou *Finance Manager* antes de prosseguir.
</Callout>

## Pré-requisitos

- Conta ativa no RevenueOS
- Acesso às configurações do projeto desejado
- (Opcional) Credenciais de API do Gateway

## Passo a Passo

### 1. Acesse o Painel
Navegue até o dashboard principal e selecione o projeto que deseja editar na barra lateral esquerda.

### 2. Configure a Integração
Vá em **Settings > Integrations**. Você verá uma lista de provedores disponíveis.

<ScreenshotFrame alt="Tela de configurações de integração mostrando opções como Stripe e Asaas" caption="Menu de Integrações no RevenueOS" />

### 3. Valide os Dados
Após conectar, o sistema fará uma sincronização inicial ("Backfill"). Siga estes passos para validar:

1.  Verifique se o indicador de status ficou verde ("Healthy").
2.  Confira se as transações recentes apareceram na aba **Transactions**.
3.  Se houver erro, consulte os Logs de Auditoria.

## Troubleshooting Comum

**Erro: Webhook falhando**
Verifique se a URL de callback está corretamente cadastrada no seu gateway. O RevenueOS exige HTTPS e validação de assinatura.

**Erro: Permissão negada**
Peça ao dono da organização para revisar seu papel (Role-Based Access Control).

## Precisa de mais ajuda?
Se este guia não resolveu seu problema, entre em contato com nosso suporte dedicado.
`;
}

const HELP_TOPICS = [
    { title: "Criando sua primeira Organização", cat: "getting-started" },
    { title: "Adicionando membros ao time", cat: "getting-started" },
    { title: "Configurando MFA (Autenticação de Dois Fatores)", cat: "getting-started" },

    { title: "Criando um novo Projeto", cat: "projects" },
    { title: "Arquivando projetos antigos", cat: "projects" },
    { title: "Gerenciando ambientes (Staging vs Prod)", cat: "projects" },

    { title: "Registrando uma venda manual", cat: "sales" },
    { title: "Importando clientes via CSV", cat: "sales" },
    { title: "Entendendo o funil de vendas", cat: "sales" },

    { title: "Visão Geral do Calendário de Recebíveis", cat: "payments" },
    { title: "Configurando Grace Period", cat: "payments" },
    { title: "Como o RevenueOS calcula atraso", cat: "payments" },
    { title: "Entendendo Aging Buckets (30/60/90)", cat: "payments" },
    { title: "Renegociando parcelas em atraso", cat: "payments" },

    { title: "Integrando com Stripe", cat: "integrations" },
    { title: "Integrando com Hotmart", cat: "integrations" },
    { title: "Integrando com Asaas (Boleto/Pix)", cat: "integrations" },
    { title: "Configurando Webhooks", cat: "integrations" },
    { title: "Rotacionando chaves de API", cat: "integrations" },

    { title: "Ativando o Copilot IA", cat: "copilot" },
    { title: "Como o Copilot sugere ações", cat: "copilot" },
    { title: "Personalizando prompts do GPT", cat: "copilot" },

    { title: "Entendendo RLS (Row Level Security)", cat: "security" },
    { title: "Logs de Auditoria: Como exportar", cat: "security" },
    { title: "Mascaramento de dados pessoais (PII)", cat: "security" },

    { title: "Monitorando saúde das integrações", cat: "ops" },
    { title: "Replay de eventos de webhook", cat: "ops" },
    { title: "Limites de taxa (Rate Limits)", cat: "ops" },
    { title: "Exportando dados brutos", cat: "ops" },
    { title: "Status do sistema RevenueOS", cat: "ops" }
];

// Fill up help articles to 45
for (let i = 0; i < 15; i++) {
    HELP_TOPICS.push({ title: `Tópico Avançado de Configuração #${i + 1}`, cat: "ops" });
}

async function main() {
    console.log('Seeding Blog Posts...');
    if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

    BLOG_TOPICS.forEach((title, index) => {
        const slug = slugify(title);
        // Add index to slug to ensure uniqueness if titles repeat
        const uniqueSlug = `${slug}-${index}`;
        const content = generateBlogContent(title);
        fs.writeFileSync(path.join(BLOG_DIR, `${uniqueSlug}.mdx`), content);
    });
    console.log(`Generated ${BLOG_TOPICS.length} blog posts.`);

    console.log('Seeding Help Articles...');
    if (!fs.existsSync(HELP_DIR)) fs.mkdirSync(HELP_DIR, { recursive: true });

    HELP_TOPICS.forEach((topic, index) => {
        const slug = slugify(topic.title);
        const uniqueSlug = `${slug}-${index}`;
        const cat = HELP_CATEGORIES.find(c => c.id === topic.cat);
        const content = generateHelpContent(topic.title, cat);
        fs.writeFileSync(path.join(HELP_DIR, `${uniqueSlug}.mdx`), content);
    });
    console.log(`Generated ${HELP_TOPICS.length} help articles.`);
}

main();
