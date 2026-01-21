
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

const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const HELP_CONTENT_MAP = {
    // GETTING STARTED
    "Criando sua primeira Organização": `## O que é uma Organização?
A Organização é a entidade legal (CNPJ/Company) dentro do RevenueOS. É o nível mais alto de hierarquia.
Todos os seus projetos, membros e faturas pertencem a uma organização.

## Passo a Passo

### 1. Cadastro Inicial
Ao fazer login pela primeira vez em \`app.revenueos.com\`, você será redirecionado para o wizard de onboarding.
Clique em **"Criar Nova Organização"**.

### 2. Dados Legais
Preencha os dados fiscais:
- **Razão Social**: O nome que aparecerá nas notas fiscais (se usar nosso emissor).
- **CNPJ/Tax ID**: Para validação de compliance.
- **Endereço Fiscal**: Obrigatório para cálculo de impostos.

### 3. Convite de Sócios
Você pode adicionar outros Owners neste momento. Eles terão acesso total (root) à conta.

<Callout type="info" title="Dica">
Se você tem múltiplas empresas (Holdings), crie uma organização separada para cada CNPJ para manter a contabilidade limpa.
</Callout>`,

    "Adicionando membros ao time": `## Gestão de Permissões (RBAC)
O RevenueOS possui um sistema granular de controle de acesso. Seguir o princípio do "privilégio mínimo" é essencial para segurança.

## Níveis de Acesso

| Role | Descrição |
|------|-----------|
| **Owner** | Acesso total, pode deletar a conta e transferir propriedade. |
| **Admin** | Pode gerenciar configurações, chaves de API e Webhooks. |
| **Developer** | Acesso às ferramentas de dev e logs, sem acesso a dados bancários sensíveis. |
| **Finance** | Acesso apenas a relatórios, extratos e dashboards (Read-only em configs). |
| **Support** | Pode visualizar dados de clientes para atendimento, sem poder exportar em massa. |

## Como Adicionar
1. Navegue até **Settings > Team**.
2. Clique no botão azul **"Invite Member"**.
3. Digite o e-mail corporativo.
4. Selecione a Role inicial.
5. O usuário receberá um link mágico para definir a senha.

<Callout type="warning">
Membros com acesso "Finance" ou superior exigem MFA ativado obrigatoriamente.
</Callout>`,

    "Configurando MFA (Autenticação de Dois Fatores)": `## Por que usar MFA?
Dados financeiros são alvos críticos. O MFA (Multi-Factor Authentication) impede 99.9% dos ataques de credential stuffing.

## Ativação

### Para seu Usuário
1. Clique no seu avatar no canto superior direito > **Profile**.
2. Em "Security", clique em **"Enable MFA"**.
3. Escaneie o QR Code com seu app (Google Authenticator, Authy, 1Password).
4. Digite o código de 6 dígitos para confirmar.
5. **Salve os Recovery Codes** em um local seguro (não no seu computador!).

### Para a Organização (Enforce)
Admins podem forçar o MFA para toda a empresa:
1. Vá em **Settings > Security**.
2. Marque a opção **"Enforce MFA for all members"**.
3. Usuários sem MFA serão deslogados e forçados a configurar no próximo login.`,

    // PROJECTS
    "Criando um novo Projeto": `## Estrutura de Projetos
Projetos funcionam como ambientes isolados dentro da sua Organização. Use projetos para separar:
- Produtos diferentes (ex: RevenueOS Billing vs RevenueOS Analytics).
- Ambientes de desenvolvimento (ex: Staging vs Production).

## Como Criar

### 1. Painel de Controle
No topo da sidebar esquerda, clique no nome do projeto atual para abrir o switcher.
Selecione **"Create Project"**.

### 2. Configuração
- **Nome**: Identificador interno.
- **Environment**: Escolha "Production" para dados reais ou "Development" para testes.
- **Região de Dados**: GRU1 (São Paulo) para menor latência ou US-EAST (N. Virginia).

### 3. Credenciais
Assim que criar, você receberá:
- \`Project ID\`: Identificador público (ex: \`proj_123xyz\`).
- \`Secret Key\`: Chave privada para o backend (ex: \`sk_live_...\`).

<Callout type="danger" title="Atenção">
A Secret Key é mostrada apenas uma vez. Se perder, você terá que rolar a chave (roll key), o que quebrará sua integração até ser atualizada.
</Callout>`,

    "Arquivando projetos antigos": `## Ciclo de Vida
Projetos de teste ou produtos descontinuados não devem poluir sua visão.
Arquivar um projeto **interrompe** todas as cobranças e rejeita novas chamadas de API.

## Procedimento
1. Entre no projeto que deseja arquivar.
2. Vá em **Project Settings > General**.
3. Role até a "Danger Zone".
4. Clique em **"Archive Project"**.
5. Digite o nome do projeto para confirmar.

Os dados históricos são mantidos por 5 anos para fins de auditoria, mas não podem mais ser modificados.`,

    "Gerenciando ambientes (Staging vs Prod)": `## Boas Práticas de DevOps
Nunca desenvolva ou teste em produção. O RevenueOS facilita isso com ambientes espelhados.

### Diferenças Staging vs Prod
- **Staging**:
  - Cartões de crédito fictícios funcionam (ex: 4242...).
  - Emails não são enviados para clientes reais (apenas para o log).
  - Webhooks são disparados normalmente.
  - Rate limits são mais relaxados.

- **Production**:
  - Transações reais.
  - Emails reais.
  - Dados imutáveis para fins contábeis.

### Header de Ambiente
Para alternar, basta mudar a chave de API (\`sk_test_...\` ou \`sk_live_...\`) no seu backend. O sistema detecta o ambiente automaticamente pelo prefixo da chave.`,

    // SALES
    "Registrando uma venda manual": `## Quando usar?
Nem todas as vendas passam pelo checkout automático. Use a Venda Manual para:
- Contratos Enterprise fechados via PIX/TED.
- Migração de dados legados.
- Vendas físicas/offline.

## Passo a Passo
1. Acesse **Sales > Transactions**.
2. Clique em **"New Transaction"** (botão superior direito).
3. Selecione o Cliente (ou crie um novo na hora).
4. Adicione os itens (SKUs) e valores.
5. Em "Payment Method", selecione "External / Manual Bank Transfer".
6. Anexe o comprovante (PDF/Imagem) para fins de reconciliação.
7. Clique em **"Create & Reconcile"**.

O sistema irá gerar a fatura, marcar como paga e lançar no fluxo de caixa imediatamente.`,

    "Importando clientes via CSV": `## Migração de Dados
Trazer dados de outro sistema? Nossa ferramenta de importação em massa lida com até 500k registros.

## Preparando o Arquivo
Baixe o template oficial em **Sales > Import > Download Template**.
Colunas obrigatórias:
- \`external_id\`: O ID do cliente no seu sistema antigo (para evitar duplicatas).
- \`email\`: Chave única de identificação.
- \`name\`: Nome completo.

## Processo de Upload
1. Salve sua planilha como \`.csv\` (UTF-8).
2. Arraste para a área de upload.
3. O sistema fará uma validação prévia (Check de emails inválidos).
4. Confirme a importação.

<Callout type="info" title="Processamento">
Importações grandes rodam em background. Você receberá um e-mail quando terminar com um relatório de erros (se houver).
</Callout>`,

    // PAYMENTS
    "Visão Geral do Calendário de Recebíveis": `## Cashflow Management
O calendário de recebíveis é sua bússola financeira. Ele projeta o fluxo de caixa futuro baseado nas datas de vencimento e nos prazos de liquidação (D+2, D+30).

## Funcionalidades
- **Filtros de Data**: Visualize por Semana, Mês ou Trimestre.
- **Status Color-coded**:
  - 🟢 **Liquidado**: Dinheiro na conta.
  - 🟡 **Projetado**: Venda feita, aguardando prazo do gateway.
  - 🔴 **Atrasado**: Vencido e não pago.
  - ⚪ **Previsto**: Assinaturas ativas que renovarão no futuro (MRR).

Use essa visão para saber exatamente quanto caixa você terá no dia 20 para pagar a folha.`,

    "Configurando Grace Period": `## O que é Grace Period?
É o "período de carência" entre o vencimento da fatura e o bloqueio do serviço.
Muitos pagamentos corporativos levam 2-3 dias para compensar. Bloquear um cliente grande por delay bancário é um erro fatal.

## Configuração
1. Vá em **Settings > Billing Rules**.
2. Localize **"Dunning & Grace Period"**.
3. Defina os dias:
   - **Soft Grace**: 3 dias (apenas lembretes gentis por email).
   - **Hard Suspension**: 7 dias (bloqueio de acesso ao software).
   - **Churn/Cancellation**: 30 dias (cancelamento do contrato).

O RevenueOS respeita essa lógica automaticamente nos webhooks de status de assinatura.`,

    "Renegociando parcelas em atraso": `## Recuperação de Receita
Às vezes o cliente quer pagar, mas precisa de fôlego. O RevenueOS permite renegociar sem sujar as métricas de churn.

## Fluxo de Renegociação
1. Abra o perfil do cliente inadimplente.
2. Na fatura atrasada, clique em **Actions > Renegotiate**.
3. Opções:
   - **Nova Data**: Postergar o vencimento.
   - **Parcelamento**: Quebrar o valor em 2x ou 3x.
   - **Desconto**: Abater juros/multa (exige aprovação de Admin).

Ao salvar, o sistema gera um novo link de pagamento atualizado e envia para o cliente. A fatura antiga é anulada e substituída pela nova (nota de débito/crédito automática).`,

    // INTEGRATIONS
    "Integrando com Stripe": `## Conexão Direta Stripe
Aceite cartões globais e Apple Pay via Stripe Connect.

## Configuração
1. Vá em **Integrations > Stripe**.
2. Cole sua \`Stripe Restricted Key\`.
3. Certifique-se que a chave tem permissões de \`Write\` para \`Customers\`, \`Charges\` e \`Invoices\`.

## Webhooks
Para receber confirmações de pagamento em tempo real, configure o endpoint do RevenueOS (\`api.revenueos.com/hooks/stripe\`) no dashboard da Stripe.
Eventos obrigatórios:
- \`invoice.payment_succeeded\`
- \`customer.subscription.deleted\`
- \`charge.refunded\``,

    "Integrando com Hotmart": `## Conexão Hotmart
Ideal para infoprodutos. Importamos automaticamente vendas e reembolsos.

## Passo a Passo
1. No painel Hotmart, vá em **Ferramentas > Webhook (API)**.
2. Adicione uma nova configuração.
3. Nome: "RevenueOS".
4. URL: \`https://api.revenueos.com.br/webhooks/hotmart\`.
5. Selecione os eventos: "Compra Aprovada", "Reembolso", "Cancelamento".
6. Copie o "Hottok" (Token de verificação).
7. Cole o token no RevenueOS em **Integrations > Hotmart**.`,

    // SECURITY
    "Entendendo RLS (Row Level Security)": `## Arquitetura Multi-Tenant
Segurança não é feature, é fundação. O RevenueOS utiliza **PostgreSQL Row Level Security (RLS)** nativo.

### Como funciona?
Cada query no banco de dados obrigatoriamente carrega o \`project_id\` do contexto atual.
\`\`\`sql
SELECT * FROM invoices WHERE project_id = current_setting('app.current_project_id');
\`\`\`

Isso significa que o banco de dados **física e logicamente recusa** retornar dados de outro projeto, mesmo se houver um erro na camada de aplicação (Node.js).
É a garantia matemática de que os dados (seus e dos seus clientes) estão isolados.`,

    "Logs de Auditoria: Como exportar": `## Compliance e Auditoria
Para certificações SOC2 ou ISO27001, você precisa provar "quem fez o quê e quando".

## Audit Trail
Registramos todas as operações de mutação (CREATE, UPDATE, DELETE):
- **Actor**: Quem iniciou (User ID ou API Key ID).
- **Resource**: Qual objeto foi afetado (ex: \`Invoice: inv_999\`).
- **Action**: O que foi feito (ex: \`status_changed: paid -> void\`).
- **Metadata**: IP de origem, User Agent, Timestamp.

## Exportação
1. Vá em **Settings > Compliance**.
2. Defina o range de datas (ex: "Último Trimestre").
3. Clique em **"Export CSV"** ou **"Export JSON"**.
4. O arquivo assinado digitalmente será enviado para o email do Owner.`
};

const BLOG_CONTENT_MAP = {
    "KPIs que Investidores olham em Series A": `## O que define uma Series A?
Ao contrário do Seed, onde a aposta é no time e na visão, a Series A é sobre **Product-Market Fit (PMF)** comprovado e **Unit Economics** saudáveis.
Investidores como a16z e Sequoia não olham mais para métricas de vaidade.

### 1. NDR (Net Dollar Retention) > 110%
Não basta apenas adquirir novos clientes; você precisa expandir a receita da base atual.
Um NDR de 120% significa que, mesmo se você parar de vender hoje, sua receita cresce 20% ano que vem.
<Callout type="success" title="Benchmark">
Top Tier SaaS: > 120%
Good: 100-110%
Bad: < 90% (Churn matando o crescimento)
</Callout>

### 2. LTV/CAC > 3x
Para cada R$ 1 investido em marketing/vendas, quanto volta?
- **CAC Payback**: Deve ser < 12 meses. Se for > 18 meses, você vai queimar caixa rápido demais.
- **Margem Bruta**: Idealmente > 80% para SaaS puro.

### 3. Burn Multiplier
Quanto você queima para gerar R$ 1 de ARR novo?
Se você queima R$ 2 para gerar R$ 1, seu multiplicador é 2x.
Em mercados de "Capital Eficiente", busca-se um multiplicador < 1.0.

## A armadilha do "Growth a qualquer custo"
Em 2021, crescer 300% ao ano era tudo. Hoje, crescer 100% com fluxo de caixa livre (FCF) positivo vale mais que 300% com burn infinito.

<CTABox title="Audite suas métricas" subtitle="O RevenueOS calcula seu NDR, LTV e CAC automaticamente em tempo real." />`,

    "O Guia Definitivo da Receita Recorrente": `## Por que Receita Recorrente?
A beleza do modelo SaaS é a previsibilidade. Mas previsibilidade exige disciplina.

### Tipos de Receita
1. **MRR (Monthly Recurring Revenue)**: O coração da operação.
2. **Expansion Revenue**: Up-sells e Cross-sells.
3. **Service Revenue**: Setup fees e consultoria (NÃO conte isso no MRR!).

<Callout type="warning" title="Erro Comum">
Muitos fundadores somam contratos de consultoria pontual ao MRR. Isso infla o valuation artificialmente e destrói a confiança na Due Diligence.
</Callout>

### Como aumentar a fidelidade
- Contratos anuais com pagamento antecipado (melhora o Cashflow).
- Lock-in via integração profunda (API).
- Suporte proativo (Customer Success não é Suporte Técnico!).

<CTABox title="Centralize sua receita" subtitle="Pare de somar planilhas. Tenha uma única fonte de verdade." />`,

    "A Verdade sobre Reconciliação Financeira": `## O Caos dos Gateways
Stripe diz que você vendeu R$ 100k. O banco diz que caiu R$ 98k. O CRM diz que tem R$ 105k fechado. Quem está certo?

### O problema da "Data Truth"
Gateways de pagamento cobram taxas, seguram reservas e fazem bundles de transferências.
Sem uma camada de normalização, seu financeiro perde 5 dias por mês tentando bater as contas.

### A Solução: Transaction Level Reconciliation
Você precisa bater cada evento de venda (invoice.paid) com cada evento bancário (transfer.received), descontando a taxa (fee).

1. **Ingestão**: Webhooks de todos os provedores.
2. **Normalização**: Converter JSONs diferentes em um modelo padrão.
3. **Matching**: Algoritmo que cruza valores e datas.

<Callout type="tip" title="Automação">
O RevenueOS faz isso automaticamente. Se houver divergência de 1 centavo, nós alertamos.
</Callout>

<CTABox title="Fim das planilhas manuais" subtitle="Reconciliação automática para Stripe, Hotmart e Asaas." />`
};

function generateBlogContent(title) {
    const specificContent = BLOG_CONTENT_MAP[title];

    // Better filler generation if no specific map
    const genericBody = `## Introdução
No cenário atual de tecnologia, **${title}** emergiu como um pilar fundamental para empresas que buscam escalabilidade e eficiência.
Não se trata apenas de uma tendência passageira, mas de uma reestruturação na forma como as operações de SaaS são conduzidas.

## O Contexto Atual
Historicamente, processos manuais dominavam este setor. Hoje, com a ascensão de ferramentas baseadas em IA e automação financeira (como o **RevenueOS**), a barra subiu.
Fundadores e CFOs não podem mais se dar ao luxo de ignorar a precisão dos dados.

### Principais Desafios
1. **Fragmentação de Dados**: Informações espalhadas em silos.
2. **Falta de Visibilidade**: Decisões baseadas em "feeling" e não em números.
3. **Lentidão Operacional**: Processos que demoram dias em vez de segundos.

<Callout type="info" title="Fato de Mercado">
Estudos mostram que empresas que automatizam ${title} reduzem o custo operacional em até 40% no primeiro ano.
</Callout>

## Estratégias para Implementação
Para dominar **${title}**, comece pelo básico: limpe seus dados.
Em seguida, integre suas ferramentas. A API do RevenueOS, por exemplo, permite conectar seu CRM direto ao Billing.

### Checklist Prático
- [ ] Mapeie seus processos atuais.
- [ ] Identifique gargalos manuais.
- [ ] Implemente uma solução de "System of Record".

## Conclusão
A jornada para dominar **${title}** é contínua. O mais importante é dar o primeiro passo hoje, garantindo que sua infraestrutura financeira suporte o crescimento de amanhã.

<CTABox title="Pronto para evoluir?" subtitle="O RevenueOS é a plataforma definitiva para orquestrar sua operação financeira." />`;

    return `---
title: "${title}"
excerpt: "Uma análise profunda sobre ${title}, com estratégias práticas para implementar na sua operação de SaaS B2B."
date: "${new Date(2025, 0, 1 + Math.floor(Math.random() * 365)).toISOString()}"
category: "${BLOG_CATEGORIES[Math.floor(Math.random() * BLOG_CATEGORIES.length)]}"
tags: ["SaaS", "Gestão", "Growth", "Finanças"]
readingTime: "${5 + Math.floor(Math.random() * 10)} min"
author: "RevenueOS Team"
---

${specificContent || genericBody}
`;
}

function generateHelpContent(title, category) {
    const specificContent = HELP_CONTENT_MAP[title];
    const body = specificContent ? specificContent : `## Visão Geral
Este artigo detalha procedimentos oficiais sobre **${title}**. 

### Pré-requisitos
- Conta ativa no RevenueOS com permissão de Admin ou Editor.
- Acesso à internet estável.

### Como configurar passo a passo
1. Acesse o **Dashboard Principal**.
2. No menu lateral, localize a seção **${category.label}**.
3. Selecione a opção **${title}**.
4. Siga o wizard de configuração na tela.

<Callout type="tip" title="Melhor Prática">
Recomendamos realizar esta configuração em um ambiente de Staging (Teste) antes de aplicar em Produção.
</Callout>

### Solução de Problemas Comuns
- **Erro 403 (Forbidden)**: Verifique se seu usuário tem a role necessária.
- **Timeouts**: Se a operação demorar mais de 30s, tente novamente mais tarde.`;

    return `---
title: "${title}"
excerpt: "Guia técnico detalhado sobre ${title}, incluindo configuração, melhores práticas e troubleshooting."
updatedAt: "2026-02-21"
category: "${category.label}"
keywords: ["${category.id}", "tutorial", "guide", "docs"]
---

${body}

<CTABox title="Precisa de ajuda avançada?" subtitle="Nosso time de engenharia está disponível para integrações complexas." />
`;
}

// Same topics list as before
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

const BLOG_TOPICS = [
    "KPIs que Investidores olham em Series A",
    "O Guia Definitivo da Receita Recorrente",
    "A Verdade sobre Reconciliação Financeira",
    "Por que Planilhas matam seu SaaS",
    "Webhook vs. Polling: Qual o melhor?",
    "O que é 'Event Sourcing' na prática",
    "Como auditar um processo financeiro",
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
    "O papel do CFO em Startups"
];

// Add more to reach 100
for (let i = 0; i < 80; i++) {
    const seeds = ["Estratégia", "Tática", "Segredo", "Erro Comum", "Futuro", "Tendência", "Análise", "Tutorial"];
    const subjects = ["de Vendas", "do Financeiro", "de Tech", "de Ops", "de Growth", "de API", "de UX"];
    BLOG_TOPICS.push(`${seeds[i % seeds.length]} ${subjects[i % subjects.length]} para SaaS de Alta Performance #${i + 1}`);
}


async function main() {
    console.log('Regenerating content...');

    if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
    BLOG_TOPICS.forEach((title, index) => {
        const slug = slugify(title);
        const uniqueSlug = `${slug}-${index}`;
        const content = generateBlogContent(title);
        fs.writeFileSync(path.join(BLOG_DIR, `${uniqueSlug}.mdx`), content);
    });

    if (!fs.existsSync(HELP_DIR)) fs.mkdirSync(HELP_DIR, { recursive: true });
    HELP_TOPICS.forEach((topic, index) => {
        const slug = slugify(topic.title);
        const uniqueSlug = `${slug}-${index}`;
        const cat = HELP_CATEGORIES.find(c => c.id === topic.cat);
        const content = generateHelpContent(topic.title, cat);
        fs.writeFileSync(path.join(HELP_DIR, `${uniqueSlug}.mdx`), content);
    });
    console.log('Done.');
}

main();
