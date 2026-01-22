# 🛠 Plano de Correção: Erros de Carregamento (App-Wide)

> **Diagnóstico:** A falha generalizada ("Failed to load customers/projects/organization") decorre principalmente de **Políticas RLS Recursivas** na tabela `memberships` e possíveis inconsistências residuais de esquema (`org_id` vs `organization_id`) em tabelas legadas.

---

## 1. O Problema (Root Cause)

1.  **Recursão Infinita (RLS):** A política de segurança da tabela `memberships` (definida em *20260122000000_organizations.sql*) consulta a própria tabela `memberships` para verificar permissão. Isso cria um loop infinito no Postgres, causando erro de execução em `getOrganization` e outras queries que dependem de verificação de membro.
2.  **Inconsistência de `org_id`:** O "Nuclear Sweep" anterior corrigiu as migrações recentes, mas não tocou profundamente nas migrações iniciais (`initial_schema.sql`, `projects_module.sql`) que definem `customers` e `projects`. Embora `initial_schema` pareça correto, o helper `is_org_member` pode estar quebrando devido à recursão na tabela base.

---

## 2. Plano de Execução

### Passo 1: Corrigir Recursão RLS em `memberships`
Substituir as políticas recursivas por funções `SECURITY DEFINER` (que bypassam RLS) ou lógica simplificada.

*   **Arquivo Alvo:** `supabase/migrations/20260122000000_organizations.sql`
*   **Ação:**
    *   Reescrever a política "Users can view members of their organizations" para evitar auto-join recursivo.
    *   Garantir a existência da função helper segura `get_user_org_ids()`.

### Passo 2: Padronizar Helper `is_org_member`
Garantir que a função `is_org_member(org_id)` seja usada uniformemente em TODAS as tabelas (`customers`, `projects`, `deals`, `insights`).

*   **Verificação:** Confirmar que `is_org_member` existe e é `SECURITY DEFINER` (para não triggerar o RLS da `memberships`).

### Passo 3: Varredura Final de Colunas (`customers`)
Criar uma "Migração de Limpeza Final" que garante que TODAS as tabelas críticas tenham a coluna `org_id` (renomeando `organization_id` se ainda existir residualmente).

*   **Tabelas a verificar:**
    *   `customers`
    *   `projects`
    *   `products`
    *   `orders`
    *   `payments`
    *   `refunds`

### Passo 4: Atualizar Ações do Servidor
Verificar se alguma *Server Action* (`src/actions/*`) está engolindo o erro real e garantir logs claros.

---

## 3. Arquivos a Modificar

### `supabase/migrations/20260122000000_organizations.sql`
```sql
-- FIX: Quebrar recursão
DROP POLICY IF EXISTS "Users can view members of their organizations" ON memberships;

-- 1. Ver o próprio membership (Base case)
CREATE POLICY "Users can view own membership" ON memberships
FOR SELECT USING (user_id = auth.uid());

-- 2. Ver outros membros (apenas de orgs que eu pertenço)
-- Requer função SECURITY DEFINER para evitar loop
CREATE POLICY "Users can view org teammates" ON memberships
FOR SELECT USING (
  org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid()) 
); 
-- ATENÇÃO: A query acima AINDA É RECURSIVA se não tiver bypass.
-- SOLUÇÃO ROBUSTA: Usar função get_my_org_ids() SECURITY DEFINER.
```

### Nova Migração: `20260222000000_fix_rls_recursion.sql`
Criaremos um arquivo novo para aplicar essas correções de forma limpa e definitiva, sem alterar o histórico passado arriscado.

1.  Criar função `get_my_org_ids()` (SECURITY DEFINER).
2.  Atualizar Policies de `memberships` usando essa função.
3.  Renomear `organization_id` -> `org_id` em `customers` (IF EXISTS).

---

## 4. Validação
1.  Rodar a nova migração.
2.  Testar `getOrganization` (deve carregar sem erro).
3.  Testar `getCustomers` (deve listar clientes).
