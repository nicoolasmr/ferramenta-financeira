# 📘 RevenueOS Blog Rewrite Playbook

Este playbook define os padrões obrigatórios para a reescrita dos 100+ artigos do blog. O objetivo é transformar conteúdo genérico em **autoridade técnica de alta performance**, focada em SEO e conversão (CTR).

## 1. Padrão Editorial (Template Obrigatório)

Todo artigo deve seguir a estrutura abaixo. Variações são permitidas, mas os elementos marcados como `[OBRIGATÓRIO]` não podem faltar.

### Estrutura do Artigo

1.  **Title SEO (Meta Title)** `[OBRIGATÓRIO]`
    *   **Regra:** Máximo 60 caracteres. Palavra-chave principal à esquerda.
    *   **Exemplo:** *Conciliação Bancária para SaaS: O Guia Definitivo (2026)*

2.  **Meta Description** `[OBRIGATÓRIO]`
    *   **Regra:** Até 155 caracteres. Deve conter a "promessa" do artigo + palavra-chave secundária + CTA implícito.
    *   **Exemplo:** *Aprenda como automatizar a conciliação bancária do seu SaaS e reduzir erros em 90%. Guia prático com templates e ferramentas.*

3.  **H1 Único** `[OBRIGATÓRIO]`
    *   Deve ser diferente do Title SEO, mais coloquial ou completo.
    *   **Exemplo:** *Conciliação Bancária: Como fechar o mês no dia 1 sem planilhas*

4.  **Introdução (A Promessa)**
    *   **Gancho (Dor):** *Você gasta 3 dias por mês conciliando Stripe e Banco?*
    *   **Solução (Promessa):** *Neste guia, vou mostrar como...*
    *   **Bullet points "O que você vai aprender":** 3 a 5 itens rápidos.

5.  **Bloco "Para quem é este guia?"** `[OBRIGATÓRIO]`
    *   Filtrar o leitor (Ex: *Ideal para CFOs, Founders e Tech Leads de SaaS B2B.*)

6.  **Definição Rápida (TL;DR)** `[OBRIGATÓRIO]`
    *   Um box ou parágrafo destacado definindo o conceito chave em 2 frases. Para ganhar o "Featured Snippet" do Google.

7.  **Conteúdo Principal (Deep Dive)**
    *   Uso intenso de **H2** e **H3**.
    *   Parágrafos curtos (3-4 linhas).
    *   **Sem enrolação:** Vá direto ao ponto técnico.

8.  **Checklists e Frameworks** `[OBRIGATÓRIO]`
    *   Pelo menos 1 checklist acionável no meio do texto.
    *   Ex: *Checklist de Validação de Webhooks (5 Passos)*

9.  **Erros Comuns e Como Evitar** `[OBRIGATÓRIO]`
    *   Seção dedicada a "Onde a maioria erra". Isso gera autoridade imediata.

10. **Métricas de Sucesso**
    *   "Como saber se deu certo?" (Ex: *Seu tempo de fechamento caiu para 2h.*)

11. **Mini FAQ (Schema)** `[OBRIGATÓRIO]`
    *   4 a 7 perguntas frequentes (puxadas do "People Also Ask" do Google).

12. **CTAs Contextuais** `[OBRIGATÓRIO]`
    *   **Meio:** Link suave (*"Veja como o RevenueOS automatiza isso..."*)
    *   **Final:** Banner ou texto forte para Demo/Trial.

---

## 2. Checklist Técnico SEO (On-Page)

Antes de publicar, verifique:

*   [ ] **URL/Slug:** Curta, sem stopwords, apenas keywords (`/blog/conciliacao-bancaria-saas`).
*   [ ] **Heading Map:** H1 único, H2 para seções principais, H3 para subseções. Nada de pular de H2 para H4.
*   [ ] **Imagens:**
    *   Nome do arquivo: `conciliacao-stripe-dashboard.png` (não `IMG_001.png`).
    *   ALT Text obrigatório e descritivo.
    *   Convertidas para WebP e comprimidas.
*   [ ] **Links Internos:**
    *   Linkar para pelo menos **3 outros artigos** do cluster (Pilar <-> Satélite).
    *   Linkar para **1 página de Feature** ou **Help Center**.
*   [ ] **Links Externos:**
    *   Pelo menos 2 links para fontes de autoridade (Stripe Docs, Bacen, VCs confiáveis).
*   [ ] **Schema Markup:**
    *   `Article` ou `BlogPosting`.
    *   `FAQPage` se houver perguntas.
*   [ ] **EEAT (Expertise):**
    *   Data de atualização visível (*"Atualizado em: ..."*).
    *   Bio do autor com cargo relevante.

---

## 3. Critérios de Qualidade (QA Gate)

Nenhum artigo passa para "Publicado" sem:

1.  **Score de Legibilidade:** Frases curtas, voz ativa.
2.  **Zero "Encheção de linguiça":** Se uma frase não adiciona valor, corte.
3.  **Validação Técnica:** O código/exemplo funciona? A explicação financeira está correta?
4.  **Mobile Check:** Tabelas e imagens não quebram no celular.

---

## 4. Matriz de Interlinking (Clusters)

Organize os links internos seguindo a lógica **Pilar (Guia)** -> **Satélite (Tutorial/Erro)**.

*   **Pilar:** *O Guia Definitivo da Receita Recorrente*
    *   **Satélites:** *Como calcular MRR*, *Erro número 1 em Churn*, *Futuro do Billing*.
    *   **Regra:** Satélites linkam para o Pilar. Pilar linka para os principais Satélites.

---

Este playbook deve ser consultado a cada reescrita. O objetivo não é apenas tráfego, é **tráfego qualificado que converte**.
