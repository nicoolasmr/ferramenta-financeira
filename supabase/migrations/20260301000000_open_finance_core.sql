-- Migration: Open Finance & Caixa Real Core
-- Sprint 1 - RevenueOS v2.1

-- 1. Bank Connections
CREATE TABLE IF NOT EXISTS public.bank_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- e.g., 'aggregator_generic'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'needs_reauth', 'revoked', 'error')),
    external_connection_id TEXT,
    consent_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    consent_granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    config_encrypted TEXT, -- tokens/refresh/metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for bank_connections
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bank connections in their org" ON public.bank_connections
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

CREATE POLICY "Admins can manage bank connections" ON public.bank_connections
FOR ALL TO authenticated
USING (org_id IN (SELECT get_my_org_ids()) AND (SELECT get_my_role(org_id)) IN ('owner', 'admin'));

-- 2. Bank Accounts
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE CASCADE NOT NULL,
    external_account_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    currency TEXT DEFAULT 'BRL',
    mask_last4 TEXT,
    institution_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bank accounts in their org" ON public.bank_accounts
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

-- 3. Bank Transactions (Raw)
CREATE TABLE IF NOT EXISTS public.bank_transactions_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    external_tx_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, provider, external_tx_id)
);

-- RLS for bank_transactions_raw
ALTER TABLE public.bank_transactions_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view raw bank txs in their org" ON public.bank_transactions_raw
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

-- 4. Bank Transactions (Normalized)
CREATE TABLE IF NOT EXISTS public.bank_transactions_normalized (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
    tx_date DATE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    amount_cents BIGINT NOT NULL, -- signed: +credit / -debit
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    description TEXT,
    counterparty TEXT,
    category TEXT,
    external_tx_id TEXT NOT NULL,
    raw_id UUID REFERENCES public.bank_transactions_raw(id) ON DELETE CASCADE,
    normalized_hash TEXT NOT NULL, -- dedupe
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indices for normalized transactions
CREATE INDEX IF NOT EXISTS idx_bank_tx_norm_lookup ON public.bank_transactions_normalized (org_id, project_id, tx_date);
CREATE INDEX IF NOT EXISTS idx_bank_tx_norm_amount ON public.bank_transactions_normalized (org_id, amount_cents);
CREATE INDEX IF NOT EXISTS idx_bank_tx_norm_hash ON public.bank_transactions_normalized (org_id, normalized_hash);

-- RLS for bank_transactions_normalized
ALTER TABLE public.bank_transactions_normalized ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view normalized bank txs in their org" ON public.bank_transactions_normalized
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

-- 5. Payout Events (Consolidated across providers)
CREATE TABLE IF NOT EXISTS public.payout_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- stripe, hotmart, asaas, etc.
    external_payout_id TEXT NOT NULL,
    payout_date DATE NOT NULL,
    amount_cents BIGINT NOT NULL,
    fees_cents BIGINT DEFAULT 0,
    net_amount_cents BIGINT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, provider, external_payout_id)
);

-- RLS for payout_events
ALTER TABLE public.payout_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payout events in their org" ON public.payout_events
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

-- 6. Payout Matches
CREATE TABLE IF NOT EXISTS public.payout_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    payout_event_id UUID REFERENCES public.payout_events(id) ON DELETE CASCADE NOT NULL,
    bank_transaction_id UUID REFERENCES public.bank_transactions_normalized(id) ON DELETE CASCADE NOT NULL,
    match_confidence INTEGER NOT NULL CHECK (match_confidence BETWEEN 0 AND 100),
    match_reason TEXT, -- exact_amount_date / tolerance_fees / split / manual
    matched_by TEXT NOT NULL DEFAULT 'auto', -- auto, manual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(payout_event_id) -- One payout matches one bank transaction (or we'd need a join table for splits, but keeping it simple for MVP)
);

-- RLS for payout_matches
ALTER TABLE public.payout_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payout matches in their org" ON public.payout_matches
FOR SELECT TO authenticated
USING (org_id IN (SELECT get_my_org_ids()));

-- 7. Audit Log integration (assuming audit_logs exists)
-- Trigger for sensitive changes could be added here.

-- 8. Views for "Caixa Real"

-- cash_real_view
CREATE OR REPLACE VIEW public.cash_real_view AS
SELECT 
    org_id,
    project_id,
    SUM(CASE WHEN direction = 'credit' THEN amount_cents ELSE 0 END) FILTER (WHERE project_id IS NOT NULL) as total_received_bank,
    (
        SELECT SUM(net_amount_cents) 
        FROM public.payout_events pe 
        WHERE pe.org_id = btn.org_id 
        AND (pe.project_id = btn.project_id OR btn.project_id IS NULL)
    ) as total_payouts_expected,
    (
        SELECT SUM(btn_m.amount_cents)
        FROM public.payout_matches pm
        JOIN public.bank_transactions_normalized btn_m ON pm.bank_transaction_id = btn_m.id
        WHERE btn_m.org_id = btn.org_id
        AND (btn_m.project_id = btn.project_id OR btn.project_id IS NULL)
    ) as total_matched,
    COALESCE(
        (SELECT SUM(net_amount_cents) FROM public.payout_events pe 
         WHERE pe.org_id = btn.org_id 
         AND pe.id NOT IN (SELECT payout_event_id FROM public.payout_matches))
    , 0) as total_unmatched_payouts
FROM public.bank_transactions_normalized btn
GROUP BY org_id, project_id;

-- payout_reconciliation_view
CREATE OR REPLACE VIEW public.payout_reconciliation_view AS
SELECT 
    pe.id as payout_id,
    pe.org_id,
    pe.project_id,
    pe.provider,
    pe.payout_date,
    pe.net_amount_cents,
    pm.id as match_id,
    pm.match_confidence,
    pm.matched_by,
    btn.description as bank_tx_description,
    btn.tx_date as bank_tx_date
FROM public.payout_events pe
LEFT JOIN public.payout_matches pm ON pe.id = pm.payout_event_id
LEFT JOIN public.bank_transactions_normalized btn ON pm.bank_transaction_id = btn.id;
