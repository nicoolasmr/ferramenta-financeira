
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
    "KPIs que Investidores olham em Series A": `## Introdução: O Novo Normal do SaaS
O mercado de Venture Capital mudou drasticamente. Se em 2021 a ordem era "crescer a qualquer custo", em 2026 a palavra-chave é **Eficiência de Capital**.
Investidores de Series A (como a16z, Sequoia, Benchmark) não olham apenas para o seu ARR (Annual Recurring Revenue). Eles querem saber a *qualidade* dessa receita.

Neste guia definitivo, abrimos a caixa-preta das métricas que separam as startups que levantam rodadas daquelas que ficam pelo caminho.

---

## 1. CAC Payback Period (O Rei das Métricas)
O Payback Period responde a uma pergunta simples: **"Quantos meses leva para recuperar o dinheiro gasto para adquirir um cliente?"**

<Callout type="info" title="Fórmula">
\`CAC Payback = (CAC / (ARPA * Margem Bruta))\`
</Callout>

### Por que isso importa?
Se o seu payback é de 24 meses, você está financiando seus clientes por dois anos. Isso exige um caixa infinito.
Em uma Series A, investidores buscam um motor de vendas eficiente.

### Benchmarks (SaaS B2B)
| Performance | Payback Period | Veredito |
|-------------|----------------|----------|
| **Best in Class** | < 9 meses | Máquina de imprimir dinheiro. |
| **Good** | 10-14 meses | Saudável e escalável. |
| **Average** | 15-18 meses | Aceitável, mas exige atenção. |
| **Bad** | > 18 meses | Queima de caixa insustentável. |

<Callout type="warning">
**Erro Comum**: Muitos fundadores esquecem de incluir a **Margem Bruta** na conta. Se sua margem é 80%, seu payback real é 20% maior do que você pensa.
</Callout>

---

## 2. NDR (Net Dollar Retention)
Adquirir clientes é caro. Manter e expandir é barato. O NDR mede quanto sua base de clientes cresceu (ou encolheu) sem contar novas vendas.

### O Poder dos Juros Compostos
Imagine duas empresas, ambas com R$ 10M de ARR.
- **Empresa A (NDR 100%)**: Daqui a 5 anos, a coorte atual ainda rende R$ 10M.
- **Empresa B (NDR 120%)**: Daqui a 5 anos, a mesma coorte rende **R$ 24.8M**.

Sem vender para **nenhum** cliente novo, a Empresa B mais que dobrou de tamanho. É isso que investidores buscam: crescimento exponencial "gratuito".

### Como melhorar seu NDR?
1. **Upsell**: Venda features mais caras (ex: Plano Enterprise).
2. **Cross-sell**: Venda produtos adjacentes.
3. **Expansion**: Cobre por uso (Usage-based pricing).

---

## 3. Burn Multiple
Popularizado por David Sacks (Craft Ventures), o Burn Multiple mede a eficiência do capital.

<Callout type="info" title="Fórmula">
\`Burn Multiple = Net Burn / Net New ARR\`
</Callout>

Ou seja: Quanto de caixa você queima para gerar R$ 1 de nova receita anual?

### A Escala de Eficiência
- **Incrível**: < 1.0x (Gasta R$ 1, gera R$ 1 de ARR)
- **Bom**: 1.0x - 1.5x
- **Suspeito**: 1.5x - 2.0x
- **Ruim**: > 2.0x
- **Terrível**: > 3.0x (Pare de escalar e conserte o balde furado)

Se você está queimando R$ 3 para gerar R$ 1, injetar mais capital na Series A apenas acelerará sua morte. Investidores sabem disso.

---

## 4. LTV/CAC (Lifetime Value / Customer Acquisition Cost)
Enquanto o Payback mede a velocidade do retorno, o LTV/CAC mede a magnitude do ROI.

### A Regra de Ouro: 3x ou mais
Para um SaaS saudável, o LTV deve ser pelo menos 3 vezes o CAC.
- **< 1x**: Você perde dinheiro a cada venda.
- **1x - 3x**: Você está trocando figurinha.
- **3x+**: Você está construindo um negócio rentável.
- **5x+**: Provavelmente você está investindo *pouco* em crescimento e deixando dinheiro na mesa.

---

## Conclusão
Preparar sua startup para uma Series A não é apenas montar um Pitch Deck bonito. É sobre construir uma máquina de receita previsível e eficiente.
Use o RevenueOS para monitorar essas métricas em tempo real, não em planilhas do Excel que quebram no final do mês.

<CTABox title="Audite suas métricas agora" subtitle="Conecte seu Stripe e descubra seu Payback, NDR e Burn Multiple em segundos." />`,

    "O Guia Definitivo da Receita Recorrente": `## Por que Receita Recorrente vale tanto?
Investidores pagam múltiplos de receita de 10x, 20x até 30x por empresas de SaaS. Por pizzarias, pagam 0.5x.
A diferença é uma só: **Previsibilidade**.

Na Receita Recorrente, você não começa o mês do zero. Você começa com 90-95% da receita do mês passado garantida.
Isso permite investir em Growth com confiança, sabendo que o LTV (Lifetime Value) vai pagar a conta.

---

## A Santíssima Trindade do MRR
Para medir o pulso do seu SaaS, você precisa separar o joio do trigo.

### 1. New MRR (Receita Nova)
Dinheiro de clientes que nunca compraram antes.
- **Saudável**: Crescimento de 10-20% MoM (Month over Month) em early stage.
- **Dica**: Se seu New MRR é alto mas o Churn também, você está enchendo um balde furado.

### 2. Expansion MRR (Expansão)
Dinheiro a mais vindo de clientes antigos. Upsells (Planos maiores) e Cross-sells (Novos produtos).
- **O segredo do Unicórnio**: Empresas como Slack e Zoom crescem mais por expansão do que por novas vendas.

### 3. Churned MRR (Receita Perdida)
O pesadelo. Clientes que cancelaram ou diminuíram o plano (Contraction).
- **Benchmark**: Busque um Net MRR Churn *negativo*. Ou seja, a Expansão deve ser maior que o Churn.

---

## 3 Erros que Destroem o Valuation
<Callout type="danger" title="Evite isso a todo custo">
1. **Contabilizar Serviços como MRR**: Setup fees, consultoria e treinamentos **NÃO** são recorrentes. Eles inflam o MRR e mentem sobre a saúde do negócio. Use uma linha separada de "Service Revenue".
2. **Booking vs Revenue**: Fechou um contrato anual de R$ 120k? Parabéns. Mas seu MRR é R$ 10k. O resto é *Deferred Revenue* (Receita Diferida). Não confunda Caixa com Receita.
3. **Esquecer os Descontos**: Se você deu 50% de desconto no primeiro mês, seu MRR real é a metade.
</Callout>

---

## Como aumentar a fidelidade (Stickiness)
Para blindar sua receita recorrente, seu produto precisa ser indispensável.
1.  **Integração Profunda**: Se o cliente pluga o seu software no ERP dele, o custo de troca (Switching Cost) fica altíssimo.
2.  **Dados Históricos**: Quanto mais dados o cliente armazena com você, mais difícil é sair.
3.  **Network Effect**: No caso de ferramentas colaborativas (como o RevenueOS), quanto mais membros do time usam, maior o valor gerado.

<CTABox title="Centralize sua receita" subtitle="Pare de somar planilhas incorretas. O RevenueOS separa MRR, Serviços e Churn automaticamente." />`,

    "A Verdade sobre Reconciliação Financeira": `## O Pesadelo Financeiro
Imagine o cenário: Seu dashboard do Stripe diz que você faturou **R$ 100.000**.
Seu banco diz que caiu **R$ 96.500**.
Seu CRM diz que você fechou **R$ 105.000** em contratos.
Seu contador pergunta: *"Onde estão os notas fiscais desses R$ 3.500 de diferença?"*

Bem-vindo ao inferno da Reconciliação Financeira.

---

## O Problema da "Data Truth"
Em sistemas financeiros complexos, não existe uma única fonte de verdade. Existem várias:
1.  **Gateway (Stripe/Adyen)**: Sabe quanto foi cobrado do cartão.
2.  **Banco**: Sabe quanto dinheiro líquido entrou.
3.  **Billing (RevenueOS)**: Sabe quanto *deveria* ter sido cobrado.
4.  **ERP**: Sabe quanto foi emitido de nota fiscal.

A discrepância acontece porque cada um fala uma língua diferente. O Stripe fala em "bruto menos taxas". O banco fala em "líquido agrupado".

---

## Transaction Level Reconciliation
A única forma de resolver isso sem enlouquecer sua equipe financeira é através da reconciliação nível transação (Transaction-Level).

### O Algoritmo de Matching
Para cada venda, você precisa de um "ID Universal" que viaje por todos os sistemas.
1.  **Venda**: \`inv_123\` criada no RevenueOS.
2.  **Cobrança**: RevenueOS envia \`inv_123\` no metadata para o Stripe.
3.  **Pagamento**: Stripe cobra o cliente e gera \`ch_999\`.
4.  **Payout**: Stripe deposita no banco e envia um relatório dizendo: *"O depósito \`dp_555\` contém a cobrança \`ch_999\` (que é a \`inv_123\`)."*

Se você tentar fazer isso manualmente no Excel com 1.000 transações/mês, você vai falhar.

---

## 3 Erros Fatais na Reconciliação
<Callout type="danger" title="Cuidado">
1. **Ignorar as Taxas (Fees)**: Se você lançar o valor bruto no banco, seu caixa nunca vai bater. É preciso desmembrar (Gross - Fee = Net).
2. **Timing (Float)**: O dinheiro da venda do dia 30 só cai no dia 02. Se fechar o mês contábil dia 30, vai faltar dinheiro.
3. **Refunds e Chargebacks**: Eles são eventos destrutivos que precisam de lançamentos de débito (estorno) corretos.
</Callout>

## Automação é a única saída
No RevenueOS, construímos um motor de "Ledger Duplo". Cada evento gera um crédito e um débito correspondente.
Se o Stripe diz que pagou e o banco não acusa o recebimento em 3 dias, o sistema alerta automaticamente: **"Missing Settlement"**.

Isso recupera, em média, **1.5%** da receita que se perde em taxas indevidas ou falhas bancárias.`,
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
