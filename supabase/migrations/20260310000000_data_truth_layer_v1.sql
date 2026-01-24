-- Migration: Data Truth Layer v1.0
-- Purpose: Canonical Events, Idempotency, and Domain Standardization

-- A) RAW LAYER (Idempotent Ingest)
-- Stores the exact payload received from providers
CREATE TABLE IF NOT EXISTS public.external_events_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'stripe', 'hotmart', 'belvo' etc.
    environment TEXT NOT NULL DEFAULT 'sandbox', -- 'sandbox' or 'production'
    event_type TEXT NOT NULL, -- 'charge.succeeded', 'PURCHASE_APPROVED'
    headers JSONB,
    payload JSONB NOT NULL,
    signature_valid BOOLEAN DEFAULT FALSE,
    idempotency_key TEXT NOT NULL, -- Hash(payload + provider + event_id)
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending', -- pending, processed, failed, ignored
    error_message TEXT,
    UNIQUE(org_id, provider, idempotency_key)
);

ALTER TABLE public.external_events_raw ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view raw events for their org" ON public.external_events_raw;
CREATE POLICY "Users can view raw events for their org" ON public.external_events_raw
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- B) NORMALIZED LAYER (Canonical Events)
-- Stores the standardized event data (after SDK normalization)
CREATE TABLE IF NOT EXISTS public.external_events_normalized (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_event_id UUID REFERENCES public.external_events_raw(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    schema_version INTEGER DEFAULT 1,
    canonical_type TEXT NOT NULL, -- 'order', 'payment', 'payout', 'refund'
    canonical_event JSONB NOT NULL, -- The standardized object
    event_refs JSONB, -- { provider_object_id, link_id, etc. }
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    normalized_hash TEXT NOT NULL, -- Dedupe hash based on canonical content
    UNIQUE(org_id, provider, normalized_hash)
);

ALTER TABLE public.external_events_normalized ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view normalized events for their org" ON public.external_events_normalized;
CREATE POLICY "Users can view normalized events for their org" ON public.external_events_normalized
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));
-- C) DOMAIN LAYER (System of Record)
-- We need to ensure existing tables have the standard 'provider' columns and constraints.

-- 1. Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS provider_object_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'sandbox';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add unique constraint if not exists (careful with existing data, might need cleanup first in prod)
-- We use a loose check here or a conditional index
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_provider_unique ON public.orders (org_id, provider, provider_object_id) WHERE provider_object_id IS NOT NULL;

-- 2. Payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_object_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'sandbox';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS fee_cents BIGINT DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS net_cents BIGINT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_unique ON public.payments (org_id, provider, provider_object_id) WHERE provider_object_id IS NOT NULL;

-- 3. Payouts
ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS provider_object_id TEXT;
ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'paid';
ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS net_cents BIGINT;
ALTER TABLE public.payouts ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_provider_unique ON public.payouts (org_id, provider, provider_object_id) WHERE provider_object_id IS NOT NULL;

-- 4. Installments
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS provider_object_id TEXT;
-- D) OBSERVABILITY
CREATE TABLE IF NOT EXISTS public.integration_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    run_type TEXT NOT NULL, -- 'webhook', 'full_sync', 'backfill'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL, -- 'running', 'completed', 'failed'
    events_processed INTEGER DEFAULT 0,
    events_failed INTEGER DEFAULT 0,
    metadata JSONB
);

ALTER TABLE public.integration_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view integration runs" ON public.integration_runs;
CREATE POLICY "Users can view integration runs" ON public.integration_runs
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

CREATE TABLE IF NOT EXISTS public.state_anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    entity_type TEXT NOT NULL, -- 'payment', 'payout'
    entity_id TEXT, -- internal ID if known
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

ALTER TABLE public.state_anomalies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view anomalies" ON public.state_anomalies;
CREATE POLICY "Users can view anomalies" ON public.state_anomalies
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- E) APPLIED VIEWS (Deterministic)

-- integration_freshness_view
DROP VIEW IF EXISTS public.integration_freshness_view CASCADE;
CREATE OR REPLACE VIEW public.integration_freshness_view AS
SELECT 
    org_id,
    provider,
    MAX(received_at) as last_event_at,
    MAX(processed_at) as last_processed_at,
    COUNT(*) FILTER (WHERE status = 'failed') as recent_errors_24h,
    CASE 
        WHEN MAX(received_at) < NOW() - INTERVAL '24 hours' THEN 'stale'
        WHEN COUNT(*) FILTER (WHERE status = 'failed') > 5 THEN 'degraded'
        ELSE 'healthy'
    END as health_status
FROM public.external_events_raw
WHERE received_at > NOW() - INTERVAL '24 hours'
GROUP BY org_id, provider;
