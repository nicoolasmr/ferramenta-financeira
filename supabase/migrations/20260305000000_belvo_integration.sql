-- Migration: Belvo Open Finance Integration
-- Purpose: Store raw and normalized bank data from Belvo.

-- 1. Integration Events (Audit Trail for Webhooks)
CREATE TABLE IF NOT EXISTS public.integration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL, -- 'belvo'
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processed, error
    error_message TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view integration events for their org" ON public.integration_events
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 2. Bank Connections (Links)
-- Note: bank_connections already exists from previous sprints, but we ensure Belvo specific fields or just reuse.
-- If bank_connections exists, we check if we need to add link_id.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bank_connections' AND column_name='link_id') THEN
        ALTER TABLE public.bank_connections ADD COLUMN link_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bank_connections' AND column_name='institution') THEN
        ALTER TABLE public.bank_connections ADD COLUMN institution TEXT;
    END IF;
END $$;

-- 3. Raw Data Tables (Deterministic Layer)
CREATE TABLE IF NOT EXISTS public.bank_accounts_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    link_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, external_id)
);

ALTER TABLE public.bank_accounts_raw ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view bank_accounts_raw for their org" ON public.bank_accounts_raw
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

CREATE TABLE IF NOT EXISTS public.bank_transactions_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    link_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, external_id)
);

ALTER TABLE public.bank_transactions_raw ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view bank_transactions_raw for their org" ON public.bank_transactions_raw
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 4. Normalized Data Tables (Canonical Layer)
CREATE TABLE IF NOT EXISTS public.bank_accounts_normalized (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    link_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    currency TEXT,
    balance_available NUMERIC,
    balance_current NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, account_id)
);

ALTER TABLE public.bank_accounts_normalized ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view bank_accounts_normalized for their org" ON public.bank_accounts_normalized
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 4. Normalized Data Tables (Canonical Layer)
-- bank_transactions_normalized already exists from previous migrations.
-- We ensure the schema is compatible.
/*
CREATE TABLE IF NOT EXISTS public.bank_transactions_normalized (
    ... already defined in 20260301000000_open_finance_core.sql ...
);
*/

-- 5. Views for "Caixa Real"

-- 6. Views for "Caixa Real"

-- cash_real_summary_view
CREATE OR REPLACE VIEW public.cash_real_summary_view AS
SELECT 
    org_id,
    project_id,
    SUM(CASE WHEN direction = 'credit' THEN amount_cents / 100.0 ELSE 0 END) as total_in,
    SUM(CASE WHEN direction = 'debit' THEN amount_cents / 100.0 ELSE 0 END) as total_out,
    COUNT(id) as tx_count,
    MAX(created_at) as last_sync_at
FROM public.bank_transactions_normalized
GROUP BY org_id, project_id;

-- payout_vs_bank_reconciliation_view
-- Compares payout_events (gateway) vs bank_transactions_normalized (bank)
CREATE OR REPLACE VIEW public.payout_vs_bank_reconciliation_view AS
SELECT 
    pe.id as payout_id,
    pe.org_id,
    pe.project_id,
    pe.net_amount_cents / 100.0 as payout_amount,
    pe.payout_date,
    btn.id as bank_tx_id,
    btn.amount_cents / 100.0 as bank_amount,
    btn.description as merchant_name,
    CASE 
        WHEN btn.id IS NOT NULL THEN 'matched'
        ELSE 'unmatched'
    END as status,
    ABS((pe.net_amount_cents / 100.0) - (btn.amount_cents / 100.0)) as delta
FROM public.payout_events pe
LEFT JOIN public.bank_transactions_normalized btn 
    ON pe.org_id = btn.org_id 
    AND (pe.project_id = btn.project_id OR btn.project_id IS NULL)
    AND btn.direction = 'credit'
    -- Simple matching logic: exact amount within 3 days
    AND ABS((pe.net_amount_cents / 100.0) - (btn.amount_cents / 100.0)) < 0.01
    AND btn.tx_date BETWEEN pe.payout_date AND (pe.payout_date + interval '3 days');

-- 6. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_bt_norm_org_proj ON public.bank_transactions_normalized(org_id, project_id);
CREATE INDEX IF NOT EXISTS idx_bt_norm_date ON public.bank_transactions_normalized(tx_date);
CREATE INDEX IF NOT EXISTS idx_ie_org_received ON public.integration_events(org_id, received_at DESC);
