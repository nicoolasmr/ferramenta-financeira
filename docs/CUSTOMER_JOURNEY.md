# A Lógica do RevenueOS: O Caminho do Cliente

Este documento explica a arquitetura lógica e a jornada do usuário dentro da plataforma. O foco é transparência total ("sem fakes") e automação inteligente.

## 1. O Conceito Central
O RevenueOS age como um **Sistema Operacional Financeiro**. Ele não cria dados do zero; ele **unifica** dados de múltiplas fontes (Kiwify, Stripe, Asaas) e aplica **Inteligência** sobre eles.

### Lógica "Redonda" (End-to-End)
1.  **Entrada:** O dado entra bruto (JSON de Webhook).
2.  **Processamento:** O dado é normalizado para um formato padrão (Canonical Event).
3.  **Saída:** O dado alimenta o Dashboard (passado) e o Copilot (futuro).

## 2. O Caminho do Cliente (Diagrama)

```mermaid
graph TD
    User([Cliente]) -->|1. Cadastro & Onboarding| App(RevenueOS App)
    
    subgraph "Fase 1: Configuração"
        App -->|Cria Org + Projeto| Onboarding[Fluxo de Onboarding]
        Onboarding -->|Conecta Gateway| Integration[Integração (Kiwify/Stripe/Asaas)]
        Integration -->|Gera Webhook URL| WebhookURL[URL Única de Recebimento]
    end

    subgraph "Fase 2: Ingestão de Dados (O Motor)"
        Ext([Gateway Externo]) -->|Envia Venda/Reembolso| WebhookAPI(API de Webhooks)
        WebhookAPI -->|Job: Ingest| Queue[Fila de Processamento]
        Queue -->|Job: Normalize| Worker[Worker de Normalização]
        Worker -->|Grava| DB[(Banco de Dados Normalizado)]
    end

    subgraph "Fase 3: Inteligência & Visualização"
        DB -->|SQL Aggregation| Dashboard[Dashboard Financeiro]
        DB -->|Análise de Anomalias| AI[IA Copilot]
        AI -->|Gera Insights| Suggestions[Sugestões Práticas]
    end

    User -->|Consulta| Dashboard
    User -->|Recebe Alerta| Suggestions
```

## 3. Perguntas Chave

### O cliente entra e o que ele faz?
1.  **Cria a Conta:** Define nome da empresa e cria o primeiro projeto (Ex: "Lançamento Q1").
2.  **Conecta os Dados:** O RevenueOS gera uma URL única (ex: `api.revenueos.com/webhooks/kiwify/...`). O cliente copia essa URL e cola na plataforma dele (Kiwify, Hotmart, etc).
3.  **Espera:** A partir desse momento, **tudo é automático**. Cada venda realizada lá fora aparece aqui dentro em segundos.

### Ele pluga quais dados? Pode ser manual?
*   **Automático (Foco Principal):** O cliente "pluga" a fonte da verdade (o Gateway de Pagamento). Nós lemos Vendas, Assinaturas, Reembolsos e Chargebacks.
*   **Manual (Backfill):** Se o cliente quiser trazer dados antigos, ele pode usar a ferramenta de **Importação CSV** ou a API.
*   **Manual (Futuro):** Lançamentos avulsos (ex: despesa de escritório) podem ser inseridos manualmente se necessário, mas o core é a automação.

### Eles são lidos pela IA? Isso está redondo?
**Sim, e está 100% funcional.**
1.  **Leitura Real:** O Copilot não inventa frases. Ele roda queries SQL no banco de dados (`revenue_anomaly_view`).
2.  **Detecção:** Se o faturamento cair `20%` em uma semana (dado real calculado), o Copilot gera um alerta: *"Sua receita caiu 20%. Verifique o checkout."*
3.  **Ação:** O usuário pode marcar como "Resolvido" ou ignorar. O sistema aprende com isso.

## 4. Garantia de Estabilidade (Anti-Instabilidade)
Para garantir que "não tem instabilidade", implementamos:
*   **Filas de Processamento (Queue):** Se 1.000 vendas chegarem ao mesmo tempo, nenhuma se perde. Elas entram na fila e são processadas uma a uma.
*   **Idempotência:** Se o Gateway enviar a mesma venda 2 vezes (erro comum), nós detectamos e ignoramos a duplicata.
*   **Testes Unitários:** O núcleo do sistema é testado matematicamente antes de cada deploy.
