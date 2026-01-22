-- Migration: RevenueOS Copilot (Deterministic AI)
-- Timestamp: 20260221000000

-- =============================================================================
-- 1. New Tables for Copilot
-- =============================================================================

-- 1.1 Insights: Stores generated analysis (Health, Anomalies, Risks)
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE, -- Nullable for Portfolio-level insights
    kind TEXT NOT NULL, -- 'portfolio_health', 'project_health', 'anomaly', 'collections', 'reconciliation', 'freshness'
    severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    evidence_json JSONB DEFAULT '{}'::jsonb, -- Store the metrics that triggered this insight
    actions_json JSONB DEFAULT '[]'::jsonb, -- Store suggested actions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't spam insights: Composite index helps finding recent similar insights
    CONSTRAINT insight_uniqueness UNIQUE (org_id, project_id, kind, created_at) -- Soft check, mostly index needed
);

-- 1.2 Actions Queue: Prioritized list of tasks for the user/system
CREATE TABLE IF NOT EXISTS public.actions_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'collect_whatsapp', 'run_sync', 'renegotiate', 'review_mapping'
    priority INTEGER NOT NULL DEFAULT 50, -- 1..100 (100 = critical)
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'dismissed', 'done'
    payload_json JSONB DEFAULT '{}'::jsonb, -- Context needed to execute the action (e.g. installment_id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 1.3 AI Settings: Org-level flags
CREATE TABLE IF NOT EXISTS public.ai_settings (
    org_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    gpt_enabled BOOLEAN DEFAULT false,
    gpt_provider TEXT DEFAULT 'openai',
    model TEXT,
    daily_insights BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Orgs view own insights" ON public.insights;
CREATE POLICY "Orgs view own insights" ON public.insights
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Orgs view own actions" ON public.actions_queue;
CREATE POLICY "Orgs view own actions" ON public.actions_queue
    FOR ALL USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Orgs view own settings" ON public.ai_settings;
CREATE POLICY "Orgs view own settings" ON public.ai_settings
    FOR ALL USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));


-- =============================================================================
-- 2. Financial Views (Deterministic "Brains")
-- =============================================================================

-- 2.1 Project Financials View (Granular Health)
DROP VIEW IF EXISTS public.project_financials_view CASCADE;
CREATE OR REPLACE VIEW public.project_financials_view AS
SELECT 
    p.org_id,
    p.id as project_id,
    p.name as project_name,
    -- Volume
    COALESCE(SUM(i.amount_cents), 0) as total_sold,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount_cents ELSE 0 END), 0) as total_received,
    COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount_cents ELSE 0 END), 0) as total_open,
    COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount_cents ELSE 0 END), 0) as total_overdue,
    -- Rates
    CASE 
        WHEN SUM(i.amount_cents) > 0 THEN 
            ROUND((SUM(CASE WHEN i.status = 'overdue' THEN i.amount_cents ELSE 0 END)::numeric / SUM(i.amount_cents)::numeric) * 100, 2)
        ELSE 0 
    END as overdue_rate,
    -- Forecast
    COALESCE(SUM(CASE WHEN i.due_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' THEN i.amount_cents ELSE 0 END), 0) as next_30d_expected
FROM public.projects p
LEFT JOIN public.installments i ON p.id = i.project_id
GROUP BY p.org_id, p.id;

-- 2.2 Integration Freshness View (Data Trust)
-- Assumes external_events table exists and has 'received_at'
DROP VIEW IF EXISTS public.integration_freshness_view CASCADE;
CREATE OR REPLACE VIEW public.integration_freshness_view AS
SELECT 
    i.org_id,
    i.provider,
    MAX(e.received_at) as last_event_at,
    NOW() - MAX(e.received_at) as time_since_last_event,
    EXTRACT(EPOCH FROM (NOW() - MAX(e.received_at))) as freshness_seconds,
    CASE 
        WHEN MAX(e.received_at) IS NULL THEN 'stale'
        WHEN MAX(e.received_at) > NOW() - INTERVAL '24 hours' THEN 'healthy'
        WHEN MAX(e.received_at) > NOW() - INTERVAL '3 days' THEN 'degraded'
        ELSE 'stale'
    END as status
FROM public.integrations i
LEFT JOIN public.external_events e ON i.org_id = e.org_id AND i.provider = e.provider
WHERE i.status = 'active'
GROUP BY i.org_id, i.provider;

-- 2.3 Reconciliation Summary View (Data Truth)
-- Compares count of Raw Events (Webhooks) vs Processed/Normalized Installments (Approximation)
DROP VIEW IF EXISTS public.reconciliation_summary_view CASCADE;
CREATE OR REPLACE VIEW public.reconciliation_summary_view AS
SELECT
    p.org_id,
    p.id as project_id,
    COUNT(DISTINCT e.id) as total_raw_events,
    COUNT(DISTINCT i.external_payment_id) as total_normalized_payments,
    (COUNT(DISTINCT e.id) - COUNT(DISTINCT i.external_payment_id)) as delta_count,
    CASE 
        WHEN COUNT(DISTINCT e.id) = 0 THEN 100
        ELSE ROUND((COUNT(DISTINCT i.external_payment_id)::numeric / COUNT(DISTINCT e.id)::numeric) * 100, 2)
    END as conversion_rate
FROM public.projects p
LEFT JOIN public.external_events e ON p.org_id = e.org_id -- Loose coupling for aggregate
LEFT JOIN public.payments i ON p.id = i.project_id
GROUP BY p.org_id, p.id;

-- 2.4 Delinquent Customers View (Target for Collections)
DROP VIEW IF EXISTS public.delinquent_customers_view CASCADE;
CREATE OR REPLACE VIEW public.delinquent_customers_view AS
SELECT
    i.org_id,
    i.project_id,
    e.customer_id,
    -- In real scenario, join with customers table for name. Using placeholder logic if customers table ambiguous
    'Customer ' || substring(e.customer_id::text, 0, 8) as name_masked,
    COUNT(i.id) as overdue_installments_count,
    SUM(i.amount_cents) as total_overdue_cents,
    MIN(i.due_date) as oldest_due_date,
    NOW()::date - MIN(i.due_date) as days_past_due
FROM public.installments i
JOIN public.enrollments e ON i.enrollment_id = e.id
WHERE i.status = 'overdue'
GROUP BY i.org_id, i.project_id, e.customer_id;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_org_created ON public.insights(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_queue_org_priority ON public.actions_queue(org_id, status, priority DESC);
