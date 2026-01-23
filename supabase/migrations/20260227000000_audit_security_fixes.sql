-- Migration: Audit Security & Performance Fixes
-- Description: Optimizes dashboard queries via RPC and standardizes RLS policies

-- 1. Optimized Dashboard Function
-- Returns all KPI numbers and timeline in one call to avoid N+1 and massive row fetching
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_start_month TIMESTAMPTZ := date_trunc('month', now());
    v_start_last_month TIMESTAMPTZ := date_trunc('month', now() - interval '1 month');
    v_30_days_ago TIMESTAMPTZ := now() - interval '30 days';
    
    v_revenue_this_month NUMERIC;
    v_revenue_last_month NUMERIC;
    v_projects_count INT;
    v_customers_count INT;
    v_integrations_count INT;
    v_timeline JSONB;
BEGIN
    -- Counts
    SELECT COUNT(*) INTO v_projects_count FROM public.projects WHERE org_id = p_org_id;
    SELECT COUNT(*) INTO v_customers_count FROM public.customers WHERE org_id = p_org_id;
    SELECT COUNT(*) INTO v_integrations_count 
    FROM public.gateway_integrations gi
    JOIN public.projects p ON p.id = gi.project_id
    WHERE p.org_id = p_org_id AND gi.is_active = true;

    -- Revenue This Month
    SELECT COALESCE(SUM(amount_cents), 0) / 100.0 INTO v_revenue_this_month
    FROM public.payments
    WHERE org_id = p_org_id AND status = 'paid' AND created_at >= v_start_month;

    -- Revenue Last Month
    SELECT COALESCE(SUM(amount_cents), 0) / 100.0 INTO v_revenue_last_month
    FROM public.payments
    WHERE org_id = p_org_id AND status = 'paid' AND created_at >= v_start_last_month AND created_at < v_start_month;

    -- Timeline (Last 30 Days)
    SELECT jsonb_agg(d) INTO v_timeline
    FROM (
        SELECT 
            created_at::date::text as date,
            SUM(amount_cents) / 100.0 as amount
        FROM public.payments
        WHERE org_id = p_org_id AND status = 'paid' AND created_at >= v_30_days_ago
        GROUP BY created_at::date
        ORDER BY created_at::date ASC
    ) d;

    RETURN jsonb_build_object(
        'projects_count', v_projects_count,
        'customers_count', v_customers_count,
        'integrations_count', v_integrations_count,
        'revenue_this_month', v_revenue_this_month,
        'revenue_last_month', v_revenue_last_month,
        'revenue_timeline', COALESCE(v_timeline, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Standardize Master Admin Access for newer tables
-- Ensure bank_transactions supports the master admin bypass correctly
DROP POLICY IF EXISTS "BankTransactions_Select" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Select" ON public.bank_transactions FOR SELECT
USING (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "BankTransactions_Insert" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Insert" ON public.bank_transactions FOR INSERT
WITH CHECK (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "BankTransactions_Update" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Update" ON public.bank_transactions FOR UPDATE
USING (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));

-- 3. Optimize gateway_integrations RLS
-- Replacing recursive JOIN with the faster is_org_member check if applicable (though this uses project_id)
-- For project-linked tables, we can use a helper that checks project ownership directly
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON m.org_id = p.org_id
    WHERE p.id = p_project_id AND m.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Users can view integrations for their projects" ON public.gateway_integrations;
CREATE POLICY "Gateway_Integrations_Select" ON public.gateway_integrations FOR SELECT
USING (is_master_admin() OR is_project_member(project_id));

DROP POLICY IF EXISTS "Admins can manage integrations" ON public.gateway_integrations;
CREATE POLICY "Gateway_Integrations_Manage" ON public.gateway_integrations FOR ALL
USING (is_master_admin() OR is_project_member(project_id));
