# 🚀 Plano Operacional: RevenueOS Blog Rewrite (SEO & Authority)

> **Objetivo:** Transformar 100+ artigos do blog em ativos de autoridade técnica, maximizando indexação, CTR e conversão para o RevenueOS.

---

## 1. Visão Geral e Estratégia

Nossa estratégia foca em **densidade de conteúdo** e **clusters semânticos**. Não vamos apenas "melhorar o texto", vamos criar os melhores guias técnicos do mercado para cada tópico (Conciliação, Billing, API, etc).

*   **Status Atual:** ~270 artigos identificados.
*   **Escopo do Projeto:** Reescrever os **Top 100** artigos de maior potencial (Keywords de alta intenção).
*   **Metodologia:** 20 Sprints de 1 grupo cada (5 artigos por grupo).
*   **Padrão de Qualidade:** Definido em [`docs/BLOG_REWRITE_PLAYBOOK.md`](./BLOG_REWRITE_PLAYBOOK.md).

---

## 2. Automação e Inventário

Criamos scripts internos para gerenciar o processo:
1.  **Inventário:** `scripts/blog_inventory.js` (Varre a pasta `content/blog` e gera JSON com metadata).
2.  **Agrupamento:** `scripts/blog_grouping.js` (Prioriza e agrupa os Top 100 artigos automaticamente).

---

## 3. Estratégia de Canibalização e Consolidação

Com 270 artigos, existem sobreposições de tema. Para evitar que posts compitam entre si no Google:

*   **Mesclar (Merge):** Se houver 2 posts fracos sobre o mesmo tema (ex: "O que é churn" e "Churn rate explicado"), o conteúdo deve ser mesclado no **Pilar** e o post antigo redirecionado (301).
*   **Redirecionar (301):** Posts antigos sem tráfego e sem backlinks devem ser depreciados e redirecionados para a categoria ou para o post mais atualizado do cluster.
*   **Canonical:** Se precisarmos manter dois posts muito parecidos por motivos de campanha, usar a tag `canonical` apontando para a versão principal.

---

## 4. Cronograma de Sprints (Semanas)

Cada Sprint foca em um cluster específico para facilitar o interlinking e manter o contexto mental do redator.

*   **Sprint 0 (Setup):** [FEITO] Criação de scripts, playbook e inventário.
*   **Sprints 1-5:** Foco em **Financeiro, Billing e API** (Core do Produto).
*   **Sprints 6-10:** Foco em **Growth, Marketing e RevOps**.
*   **Sprints 11-15:** Foco em **SaaS Growth e Management**.
*   **Sprints 16-20:** Foco em **Tech, Engenharia, UX e Vendas**.

---

## 4. Matriz de Execução (Os 20 Grupos)

Abaixo, a lista priorizada dos 100 artigos que serão reescritos, divididos em 20 grupos temáticos.

### Grupo 01 - Foco: Financeiro & Billing
**Objetivo:** Dominar a semântica de Financeiro & Billing com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `o-guia-definitivo-da-receita-recorrente-0` | Reescrever (Template Padrão) |
| 2 | `o-guia-definitivo-da-receita-recorrente-1` | Reescrever (Template Padrão) |
| 3 | `a-verdade-sobre-reconciliacao-financeira-2` | Reescrever (Template Padrão) |
| 4 | `webhook-vs-polling-qual-o-melhor-4` | Reescrever (Template Padrão) |
| 5 | `o-guia-definitivo-de-aging-report-para-cfos-de-saas` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Financeiro & Billing, Feature Page > Financeiro & Billing
**CTA:** Agendar Demo focada em Financeiro & Billing
---

### Grupo 02 - Foco: Financeiro & Billing
**Objetivo:** Dominar a semântica de Financeiro & Billing com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `tutorial-do-financeiro-para-saas-de-alta-performance-16-34` | Reescrever (Template Padrão) |
| 2 | `tutorial-do-financeiro-para-saas-de-alta-performance-16-35` | Reescrever (Template Padrão) |
| 3 | `tutorial-do-financeiro-para-saas-de-alta-performance-72-90` | Reescrever (Template Padrão) |
| 4 | `tutorial-do-financeiro-para-saas-de-alta-performance-72-91` | Reescrever (Template Padrão) |
| 5 | `erro-comum-do-financeiro-para-saas-de-alta-performance-44-62` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Financeiro & Billing, Feature Page > Financeiro & Billing
**CTA:** Agendar Demo focada em Financeiro & Billing
---

### Grupo 03 - Foco: API & Integrações
**Objetivo:** Dominar a semântica de API & Integrações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `erro-comum-do-financeiro-para-saas-de-alta-performance-44-63` | Reescrever (Template Padrão) |
| 2 | `tutorial-de-api-para-saas-de-alta-performance-48-66` | Reescrever (Template Padrão) |
| 3 | `tutorial-de-api-para-saas-de-alta-performance-48-67` | Reescrever (Template Padrão) |
| 4 | `erro-comum-de-api-para-saas-de-alta-performance-20-38` | Reescrever (Template Padrão) |
| 5 | `erro-comum-de-api-para-saas-de-alta-performance-20-39` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > API & Integrações, Feature Page > API & Integrações
**CTA:** Agendar Demo focada em API & Integrações
---

### Grupo 04 - Foco: API & Integrações
**Objetivo:** Dominar a semântica de API & Integrações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `erro-comum-de-api-para-saas-de-alta-performance-76-94` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-api-para-saas-de-alta-performance-76-95` | Reescrever (Template Padrão) |
| 3 | `asaas-vs-iugu-qual-a-melhor-api-de-pix-para-b2b` | Reescrever (Template Padrão) |
| 4 | `futuro-de-api-para-saas-de-alta-performance-13-31` | Reescrever (Template Padrão) |
| 5 | `futuro-de-api-para-saas-de-alta-performance-13-32` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > API & Integrações, Feature Page > API & Integrações
**CTA:** Agendar Demo focada em API & Integrações
---

### Grupo 05 - Foco: API & Integrações
**Objetivo:** Dominar a semântica de API & Integrações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `futuro-de-api-para-saas-de-alta-performance-69-87` | Reescrever (Template Padrão) |
| 2 | `futuro-de-api-para-saas-de-alta-performance-69-88` | Reescrever (Template Padrão) |
| 3 | `analise-de-api-para-saas-de-alta-performance-55-73` | Reescrever (Template Padrão) |
| 4 | `analise-de-api-para-saas-de-alta-performance-55-74` | Reescrever (Template Padrão) |
| 5 | `estrategia-de-api-para-saas-de-alta-performance-41-59` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > API & Integrações, Feature Page > API & Integrações
**CTA:** Agendar Demo focada em API & Integrações
---

### Grupo 06 - Foco: API & Integrações
**Objetivo:** Dominar a semântica de API & Integrações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `estrategia-de-api-para-saas-de-alta-performance-41-60` | Reescrever (Template Padrão) |
| 2 | `segredo-de-api-para-saas-de-alta-performance-27-45` | Reescrever (Template Padrão) |
| 3 | `segredo-de-api-para-saas-de-alta-performance-27-46` | Reescrever (Template Padrão) |
| 4 | `tatica-de-api-para-saas-de-alta-performance-34-52` | Reescrever (Template Padrão) |
| 5 | `tatica-de-api-para-saas-de-alta-performance-34-53` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > API & Integrações, Feature Page > API & Integrações
**CTA:** Agendar Demo focada em API & Integrações
---

### Grupo 07 - Foco: Growth & Marketing
**Objetivo:** Dominar a semântica de Growth & Marketing com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `tendencia-de-api-para-saas-de-alta-performance-6-24` | Reescrever (Template Padrão) |
| 2 | `tendencia-de-api-para-saas-de-alta-performance-6-25` | Reescrever (Template Padrão) |
| 3 | `tutorial-de-growth-para-saas-de-alta-performance-40-58` | Reescrever (Template Padrão) |
| 4 | `tutorial-de-growth-para-saas-de-alta-performance-40-59` | Reescrever (Template Padrão) |
| 5 | `erro-comum-de-growth-para-saas-de-alta-performance-12-30` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Growth & Marketing, Feature Page > Growth & Marketing
**CTA:** Agendar Demo focada em Growth & Marketing
---

### Grupo 08 - Foco: Growth & Marketing
**Objetivo:** Dominar a semântica de Growth & Marketing com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `erro-comum-de-growth-para-saas-de-alta-performance-12-31` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-growth-para-saas-de-alta-performance-68-86` | Reescrever (Template Padrão) |
| 3 | `erro-comum-de-growth-para-saas-de-alta-performance-68-87` | Reescrever (Template Padrão) |
| 4 | `futuro-de-growth-para-saas-de-alta-performance-5-23` | Reescrever (Template Padrão) |
| 5 | `futuro-de-growth-para-saas-de-alta-performance-5-24` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Growth & Marketing, Feature Page > Growth & Marketing
**CTA:** Agendar Demo focada em Growth & Marketing
---

### Grupo 09 - Foco: RevOps & Operações
**Objetivo:** Dominar a semântica de RevOps & Operações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `futuro-de-growth-para-saas-de-alta-performance-61-79` | Reescrever (Template Padrão) |
| 2 | `futuro-de-growth-para-saas-de-alta-performance-61-80` | Reescrever (Template Padrão) |
| 3 | `tutorial-de-ops-para-saas-de-alta-performance-32-50` | Reescrever (Template Padrão) |
| 4 | `tutorial-de-ops-para-saas-de-alta-performance-32-51` | Reescrever (Template Padrão) |
| 5 | `erro-comum-de-ops-para-saas-de-alta-performance-4-22` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > RevOps & Operações, Feature Page > RevOps & Operações
**CTA:** Agendar Demo focada em RevOps & Operações
---

### Grupo 10 - Foco: RevOps & Operações
**Objetivo:** Dominar a semântica de RevOps & Operações com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `erro-comum-de-ops-para-saas-de-alta-performance-4-23` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-ops-para-saas-de-alta-performance-60-78` | Reescrever (Template Padrão) |
| 3 | `erro-comum-de-ops-para-saas-de-alta-performance-60-79` | Reescrever (Template Padrão) |
| 4 | `futuro-de-ops-para-saas-de-alta-performance-53-71` | Reescrever (Template Padrão) |
| 5 | `futuro-de-ops-para-saas-de-alta-performance-53-72` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > RevOps & Operações, Feature Page > RevOps & Operações
**CTA:** Agendar Demo focada em RevOps & Operações
---

### Grupo 11 - Foco: SaaS Growth
**Objetivo:** Dominar a semântica de SaaS Growth com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `como-implementar-uma-regua-de-dunning-que-recupera-40-da-receita` | Reescrever (Template Padrão) |
| 2 | `tutorial-avancado-implementando-cac-em-node-js` | Reescrever (Template Padrão) |
| 3 | `tutorial-avancado-implementando-dunning-em-node-js` | Reescrever (Template Padrão) |
| 4 | `tutorial-avancado-implementando-ledger-em-node-js` | Reescrever (Template Padrão) |
| 5 | `tutorial-avancado-implementando-ltv-em-node-js` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > SaaS Growth, Feature Page > SaaS Growth
**CTA:** Agendar Demo focada em SaaS Growth
---

### Grupo 12 - Foco: SaaS Growth
**Objetivo:** Dominar a semântica de SaaS Growth com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `tutorial-avancado-implementando-nota-fiscal-em-node-js` | Reescrever (Template Padrão) |
| 2 | `tutorial-avancado-implementando-rule-of-40-em-node-js` | Reescrever (Template Padrão) |
| 3 | `tutorial-avancado-implementando-split-de-pagamento-em-node-js` | Reescrever (Template Padrão) |
| 4 | `a-verdade-sobre-cac-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 5 | `a-verdade-sobre-dunning-que-ninguem-te-conta` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > SaaS Growth, Feature Page > SaaS Growth
**CTA:** Agendar Demo focada em SaaS Growth
---

### Grupo 13 - Foco: SaaS Growth
**Objetivo:** Dominar a semântica de SaaS Growth com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `a-verdade-sobre-hotmart-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 2 | `a-verdade-sobre-ledger-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 3 | `a-verdade-sobre-mrr-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 4 | `a-verdade-sobre-ndr-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 5 | `a-verdade-sobre-pix-que-ninguem-te-conta` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > SaaS Growth, Feature Page > SaaS Growth
**CTA:** Agendar Demo focada em SaaS Growth
---

### Grupo 14 - Foco: SaaS Growth
**Objetivo:** Dominar a semântica de SaaS Growth com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `a-verdade-sobre-split-de-pagamento-que-ninguem-te-conta` | Reescrever (Template Padrão) |
| 2 | `o-futuro-de-cac-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 3 | `o-futuro-de-dunning-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 4 | `o-futuro-de-ledger-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 5 | `o-futuro-de-mrr-com-a-chegada-da-ia` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > SaaS Growth, Feature Page > SaaS Growth
**CTA:** Agendar Demo focada em SaaS Growth
---

### Grupo 15 - Foco: SaaS Management
**Objetivo:** Dominar a semântica de SaaS Management com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `o-futuro-de-pix-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 2 | `o-futuro-de-split-de-pagamento-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 3 | `tutorial-avancado-implementando-asaas-em-node-js` | Reescrever (Template Padrão) |
| 4 | `stripe-vs-asaas-comparativo-2026-8` | Reescrever (Template Padrão) |
| 5 | `stripe-vs-asaas-comparativo-2026-9` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > SaaS Management, Feature Page > SaaS Management
**CTA:** Agendar Demo focada em SaaS Management
---

### Grupo 16 - Foco: Tech & Engenharia
**Objetivo:** Dominar a semântica de Tech & Engenharia com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `o-futuro-de-asaas-com-a-chegada-da-ia` | Reescrever (Template Padrão) |
| 2 | `tutorial-de-tech-para-saas-de-alta-performance-24-42` | Reescrever (Template Padrão) |
| 3 | `tutorial-de-tech-para-saas-de-alta-performance-24-43` | Reescrever (Template Padrão) |
| 4 | `tutorial-de-tech-para-saas-de-alta-performance-80-98` | Reescrever (Template Padrão) |
| 5 | `tutorial-de-tech-para-saas-de-alta-performance-80-99` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Tech & Engenharia, Feature Page > Tech & Engenharia
**CTA:** Agendar Demo focada em Tech & Engenharia
---

### Grupo 17 - Foco: UX & Produto
**Objetivo:** Dominar a semântica de UX & Produto com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `erro-comum-de-tech-para-saas-de-alta-performance-52-70` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-tech-para-saas-de-alta-performance-52-71` | Reescrever (Template Padrão) |
| 3 | `futuro-de-tech-para-saas-de-alta-performance-45-63` | Reescrever (Template Padrão) |
| 4 | `futuro-de-tech-para-saas-de-alta-performance-45-64` | Reescrever (Template Padrão) |
| 5 | `tutorial-de-ux-para-saas-de-alta-performance-56-74` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > UX & Produto, Feature Page > UX & Produto
**CTA:** Agendar Demo focada em UX & Produto
---

### Grupo 18 - Foco: UX & Produto
**Objetivo:** Dominar a semântica de UX & Produto com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `tutorial-de-ux-para-saas-de-alta-performance-56-75` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-ux-para-saas-de-alta-performance-28-46` | Reescrever (Template Padrão) |
| 3 | `erro-comum-de-ux-para-saas-de-alta-performance-28-47` | Reescrever (Template Padrão) |
| 4 | `futuro-de-ux-para-saas-de-alta-performance-21-39` | Reescrever (Template Padrão) |
| 5 | `futuro-de-ux-para-saas-de-alta-performance-21-40` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > UX & Produto, Feature Page > UX & Produto
**CTA:** Agendar Demo focada em UX & Produto
---

### Grupo 19 - Foco: Vendas & CRM
**Objetivo:** Dominar a semântica de Vendas & CRM com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `futuro-de-ux-para-saas-de-alta-performance-77-95` | Reescrever (Template Padrão) |
| 2 | `futuro-de-ux-para-saas-de-alta-performance-77-96` | Reescrever (Template Padrão) |
| 3 | `tutorial-de-vendas-para-saas-de-alta-performance-64-82` | Reescrever (Template Padrão) |
| 4 | `tutorial-de-vendas-para-saas-de-alta-performance-64-83` | Reescrever (Template Padrão) |
| 5 | `tutorial-de-vendas-para-saas-de-alta-performance-8-26` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Vendas & CRM, Feature Page > Vendas & CRM
**CTA:** Agendar Demo focada em Vendas & CRM
---

### Grupo 20 - Foco: Vendas & CRM
**Objetivo:** Dominar a semântica de Vendas & CRM com conteúdo denso.

| Ordem | Artigo Atual (Slug) | Ação Recomendada |
| :--- | :--- | :--- |
| 1 | `tutorial-de-vendas-para-saas-de-alta-performance-8-27` | Reescrever (Template Padrão) |
| 2 | `erro-comum-de-vendas-para-saas-de-alta-performance-36-54` | Reescrever (Template Padrão) |
| 3 | `erro-comum-de-vendas-para-saas-de-alta-performance-36-55` | Reescrever (Template Padrão) |
| 4 | `futuro-de-vendas-para-saas-de-alta-performance-29-47` | Reescrever (Template Padrão) |
| 5 | `futuro-de-vendas-para-saas-de-alta-performance-29-48` | Reescrever (Template Padrão) |

**Links Internos Sugeridos:** Help Center > Vendas & CRM, Feature Page > Vendas & CRM
**CTA:** Agendar Demo focada em Vendas & CRM
---

## 5. Plano de Medição de Resultados

Acompanharemos o sucesso do projeto através dos seguintes KPIs:

1.  **Indexação e Impressões (GSC):**
    *   Monitorar crescimento de impressões para keywords long-tail.
    *   Target: 20% de aumento MoM após reescrita.
2.  **Engajamento (GA4):**
    *   Tempo na página > 2:30 min.
    *   Scroll Depth > 75% da página.
3.  **Conversão (Negócio):**
    *   `Goal Completion`: Clique em "Agendar Demo" ou "Start Free Trial".
    *   `Assisted Conversions`: Artigos do blog como touchpoint na jornada.

---

## 6. Próximos Passos
1.  Aprovar este plano.
2.  Iniciar **Sprint 01** (Grupo 01 - Financeiro).
3.  Utilizar o script `scripts/blog_grouping.js` para gerar novos grupos se necessário.
