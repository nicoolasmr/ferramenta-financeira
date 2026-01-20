-- Migration: Patch v3 Full Experience (Integrations, AI, Financial Views)

-- 1. Integrations Module
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL, -- references auth.users (handled by app logic/RLS)
    provider TEXT NOT NULL, -- 'stripe', 'hotmart', 'kiwify', etc.
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'error'
    config_encrypted TEXT, -- JSON string encrypted or plain JSON depending on strategy
    webhook_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.external_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    integration_id UUID REFERENCES public.integrations(id),
    provider TEXT NOT NULL,
    external_account_id TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.external_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    provider TEXT NOT NULL,
    external_event_id TEXT, -- unique per provider usually
    event_type TEXT NOT NULL,
    payload_json JSONB,
    status TEXT NOT NULL DEFAULT 'received', -- 'received', 'processed', 'failed', 'ignored'
    error_text TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Integrations
CREATE INDEX IF NOT EXISTS idx_integrations_org ON public.integrations(org_id);
CREATE INDEX IF NOT EXISTS idx_ext_events_org ON public.external_events(org_id);
CREATE INDEX IF NOT EXISTS idx_ext_events_provider_id ON public.external_events(provider, external_event_id);

-- 2. AI History Module
CREATE TABLE IF NOT EXISTS public.ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    project_id UUID, -- optional, if project-specific
    mode TEXT NOT NULL, -- 'global', 'project', 'wizard'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    run_id UUID REFERENCES public.ai_runs(id),
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI
CREATE INDEX IF NOT EXISTS idx_ai_runs_org ON public.ai_runs(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_run ON public.ai_messages(run_id);

-- 3. Update Existing Financial Tables (Add Support for Refunds/Chargebacks if missing)
-- Checking if we need to add columns to installments or payments. 
-- For MVP v3, we assume 'status' column in installments handles 'refunded'/'chargeback'.
-- However, we should ensure payments table exists and is used.

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    project_id UUID REFERENCES public.projects(id),
    enrollment_id UUID REFERENCES public.enrollments(id), -- optional linkage
    installment_id UUID REFERENCES public.installments(id), -- optional linkage
    external_payment_id TEXT,
    provider TEXT,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'paid', 'refunded', 'failed'
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_org_project ON public.payments(org_id, project_id);

-- 4. Financial Views

-- Portfolio Financials View (Aggregated by Org)
CREATE OR REPLACE VIEW public.portfolio_financials_view AS
SELECT 
    org_id,
    COUNT(DISTINCT project_id) as active_projects,
    SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END) as total_received_cents,
    SUM(CASE WHEN status = 'overdue' THEN amount_cents ELSE 0 END) as total_overdue_cents,
    SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END) as total_open_cents,
    SUM(amount_cents) as total_volume_cents
FROM public.installments
GROUP BY org_id;

-- Receivables Aging View
CREATE OR REPLACE VIEW public.receivables_aging_view AS
SELECT 
    org_id,
    project_id,
    SUM(CASE WHEN due_date < NOW() AND due_date >= NOW() - INTERVAL '30 days' THEN amount_cents ELSE 0 END) as overdue_30,
    SUM(CASE WHEN due_date < NOW() - INTERVAL '30 days' AND due_date >= NOW() - INTERVAL '60 days' THEN amount_cents ELSE 0 END) as overdue_60,
    SUM(CASE WHEN due_date < NOW() - INTERVAL '60 days' THEN amount_cents ELSE 0 END) as overdue_90_plus
FROM public.installments
WHERE status = 'overdue'
GROUP BY org_id, project_id;


-- 5. RLS Policies (Enable RLS and Add Policies)

-- Integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage integrations provided org_id matches" ON public.integrations
    USING ( (select auth.uid()) = org_id ) -- Simplified mapping assuming user.id IS org_id or 1:1 for MVP
    WITH CHECK ( (select auth.uid()) = org_id );

-- External Events (Logs)
ALTER TABLE public.external_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view external events for their org" ON public.external_events
    FOR SELECT USING ( (select auth.uid()) = org_id );

-- AI Tables
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their AI history" ON public.ai_runs
    USING ( (select auth.uid()) = org_id );
CREATE POLICY "Users can access their AI messages" ON public.ai_messages
    USING ( (select auth.uid()) = org_id );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their payments" ON public.payments
    USING ( (select auth.uid()) = org_id );
