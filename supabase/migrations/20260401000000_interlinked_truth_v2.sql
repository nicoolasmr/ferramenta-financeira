-- Migration: Interlinked Truth v2.2
-- Purpose: Identity Spine, Ledger, Consistency Engine, and Decision Views

-- ========================================================
-- A) IDENTITY SPINE (external_refs)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.external_refs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'customer', 'order', 'payment', 'installment', 'payout', 'refund', 'dispute', 'bank_tx'
    provider_object_id TEXT NOT NULL,
    canonical_table TEXT NOT NULL,
    canonical_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, provider, entity_type, provider_object_id)
);

ALTER TABLE public.external_refs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view external refs for their org" ON public.external_refs;
CREATE POLICY "Users can view external refs for their org" ON public.external_refs
    FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- Indexes for lookup performance
CREATE INDEX IF NOT EXISTS idx_ext_refs_org_entity ON public.external_refs(org_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_ext_refs_org_table ON public.external_refs(org_id, canonical_table);
CREATE INDEX IF NOT EXISTS idx_ext_refs_lookup ON public.external_refs(org_id, provider, provider_object_id);

-- ========================================================
-- B) LEDGER (ledger_entries)
-- ========================================================

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    category TEXT NOT NULL, -- 'sale', 'payment_fee', 'refund', 'chargeback', 'payout', 'bank_credit', 'bank_debit', 'adjustment', 'tax'
    source_type TEXT NOT NULL, -- 'order', 'payment', 'installment', 'refund', 'dispute', 'payout', 'bank_tx', 'manual'
    source_id UUID NOT NULL,
    source_provider TEXT,
    source_external_id TEXT,
    -- Links to Domain
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL,
    payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL,
    -- bank_tx_id UUID REFERENCES public.bank_transactions_normalized(id) ON DELETE SET NULL, -- Deferred to avoid circular dependency if table not ready, assumed normalized exists from v1
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    -- Idempotency hash calculated by the Application (Pipeline)
    -- Formula: md5(org_id || source_type || source_id || category || amount_cents || entry_date)
    idempotency_key TEXT NOT NULL
);

-- Note: The generated column above is a simplification for Postgres 12+. If older, use a trigger or app logic. 
-- Assuming Postgres 15+ on Supabase.
-- Actually, strict idempotency usually requires a caller-provided key. 
-- But "Derived Idempotency" from content works for the "Consistency Engine" rebuilding the ledger.
-- Let's add a UNIQUE constraint on this derived key.

CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_idempotency ON public.ledger_entries(idempotency_key);

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view ledger for their org" ON public.ledger_entries;
CREATE POLICY "Users can view ledger for their org" ON public.ledger_entries
    FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

CREATE INDEX IF NOT EXISTS idx_ledger_org_proj_date ON public.ledger_entries(org_id, project_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_ledger_category ON public.ledger_entries(org_id, category);

-- ========================================================
-- C) CONSISTENCY ENGINE (state_anomalies updates)
-- ========================================================
-- Table likely exists from v1, ensuring columns.

DO $$ 
BEGIN 
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='project_id') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='provider') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN provider TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='anomaly_type') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN anomaly_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='severity') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN severity TEXT DEFAULT 'warning';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='status') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN status TEXT DEFAULT 'open';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='state_anomalies' AND column_name='details') THEN
        ALTER TABLE public.state_anomalies ADD COLUMN details JSONB;
    END IF;
END $$;

-- ========================================================
-- D) APPLIED VIEWS (Decision Layer)
-- ========================================================

-- D1. Portfolio Health View (Ranking)
DROP VIEW IF EXISTS public.portfolio_health_view CASCADE;
CREATE OR REPLACE VIEW public.portfolio_health_view AS
SELECT 
    p.id as project_id,
    p.org_id,
    p.name as project_name,
    -- Metrics
    COALESCE(pf.total_sold, 0) as total_sold,
    COALESCE(pf.total_received, 0) as total_received,
    COALESCE(pf.total_overdue, 0) as total_overdue,
    -- Anomaly Counts
    (SELECT COUNT(*) FROM public.state_anomalies sa WHERE sa.project_id = p.id AND sa.status = 'open' AND sa.severity = 'critical') as critical_anomalies,
    (SELECT COUNT(*) FROM public.state_anomalies sa WHERE sa.project_id = p.id AND sa.status = 'open' AND sa.severity = 'warning') as warning_anomalies,
    -- Score Calculation (Simplistic implementation for SQL view)
    -- 100 - (Critical * 20) - (Warning * 5) - (OverdueRate * 100)
    GREATEST(0, 100 
        - ((SELECT COUNT(*) FROM public.state_anomalies sa WHERE sa.project_id = p.id AND sa.status = 'open' AND sa.severity = 'critical') * 20)
        - (CASE WHEN pf.total_sold > 0 THEN (pf.total_overdue::numeric / pf.total_sold::numeric) * 50 ELSE 0 END)
    )::integer as health_score
FROM public.projects p
LEFT JOIN public.project_financials_view pf ON pf.project_id = p.id;

GRANT SELECT ON public.portfolio_health_view TO authenticated;

-- D2. Decision Actions View
-- Determining top actions deterministically
DROP VIEW IF EXISTS public.decision_actions_view CASCADE;
CREATE OR REPLACE VIEW public.decision_actions_view AS
SELECT 
    p.id as project_id,
    p.org_id,
    'critical' as priority,
    'review_reconciliation' as action_type,
    'Critical Anomaly Detected' as title,
    ('There are ' || count(*) || ' critical data gaps.') as description,
    jsonb_build_object('count', count(*)) as payload
FROM public.state_anomalies sa
JOIN public.projects p ON sa.project_id = p.id
WHERE sa.status = 'open' AND sa.severity = 'critical'
GROUP BY p.id, p.org_id

UNION ALL

-- Stale Integration
SELECT 
    p.id as project_id,
    p.org_id,
    'high' as priority,
    'run_sync' as action_type,
    'Integration Stale' as title,
    ('Connection to ' || ifv.provider || ' is stale.') as description,
    jsonb_build_object('provider', ifv.provider) as payload
FROM public.projects p
JOIN public.integration_freshness_view ifv ON ifv.org_id = p.org_id -- Assuming org-wide integrations for now
WHERE ifv.health_status IN ('stale', 'degraded');

GRANT SELECT ON public.decision_actions_view TO authenticated;

-- D3. Cash Real View (Bank vs Payouts)
DROP VIEW IF EXISTS public.cash_real_view CASCADE;
CREATE OR REPLACE VIEW public.cash_real_view AS
SELECT 
    rsv.org_id,
    rsv.project_id,
    rsv.provider,
    rsv.gateway_payouts as expected_cash,
    rsv.bank_received_total as actual_cash,
    (rsv.bank_received_total - rsv.gateway_payouts) as cash_gap
FROM public.reconciliation_summary_view rsv;

GRANT SELECT ON public.cash_real_view TO authenticated;
