-- Migration: AI Copilot 2.0 Core
-- Description: Harmonizes copilot_suggestions schema and adds anomaly detection logic

-- 1. Fix copilot_suggestions table
-- Add missing columns and make project_id optional for global insights
ALTER TABLE public.copilot_suggestions 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'completed')),
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'default';

-- Update existing rows to have org_id from their projects (if any)
UPDATE public.copilot_suggestions s
SET org_id = p.org_id
FROM public.projects p
WHERE s.project_id = p.id AND s.org_id IS NULL;

-- Make project_id optional
ALTER TABLE public.copilot_suggestions ALTER COLUMN project_id DROP NOT NULL;

-- 2. Create Revenue Anomaly View
-- This view calculates week-over-week revenue changes to detect drops
CREATE OR REPLACE VIEW public.revenue_anomaly_view AS
WITH weekly_revenue AS (
    SELECT 
        org_id,
        date_trunc('week', created_at) as week,
        SUM(amount_cents) / 100.0 as revenue
    FROM public.payments
    WHERE status = 'paid'
    GROUP BY org_id, week
),
revenue_comparison AS (
    SELECT 
        org_id,
        week,
        revenue as current_week_revenue,
        LAG(revenue) OVER (PARTITION BY org_id ORDER BY week) as prev_week_revenue
    FROM weekly_revenue
)
SELECT 
    org_id,
    week,
    current_week_revenue,
    prev_week_revenue,
    CASE 
        WHEN prev_week_revenue > 0 THEN 
            ((current_week_revenue - prev_week_revenue) / prev_week_revenue) * 100
        ELSE 0 
    END as wow_change_pct
FROM revenue_comparison;

-- 3. Standardize RLS for copilot_suggestions
ALTER TABLE public.copilot_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view copilot suggestions for their projects" ON public.copilot_suggestions;
DROP POLICY IF EXISTS "Copilot_Suggestions_Select" ON public.copilot_suggestions;

CREATE POLICY "Copilot_Suggestions_Select" ON public.copilot_suggestions FOR SELECT
USING (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));

CREATE POLICY "Copilot_Suggestions_Update" ON public.copilot_suggestions FOR UPDATE
USING (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));

-- 4. Audit Log Integration
-- Ensure we can log when an anomaly is generated
COMMENT ON VIEW public.revenue_anomaly_view IS 'Calculates week-over-week revenue trends for AI Copilot anomaly detection.';
