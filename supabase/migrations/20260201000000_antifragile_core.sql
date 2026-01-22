-- Migration: Anti-Fragile Core (Epics A & B)

-- =============================================================================
-- 1. Providers Catalog (Tier 1/2/3)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.providers_catalog (
    provider TEXT PRIMARY KEY, -- 'stripe', 'hotmart', 'asaas'
    tier TEXT NOT NULL CHECK (tier IN ('1', '2', '3')),
    supports_backfill BOOLEAN DEFAULT false,
    supports_replay BOOLEAN DEFAULT false,
    docs_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.providers_catalog ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid duplicate error
DROP POLICY IF EXISTS "Public read catalog" ON public.providers_catalog;
CREATE POLICY "Public read catalog" ON public.providers_catalog FOR SELECT USING (true);

-- Seed Initial Catalog
INSERT INTO public.providers_catalog (provider, tier, supports_backfill, supports_replay) VALUES
('stripe', '1', true, true),
('hotmart', '1', false, true),
('asaas', '1', true, true)
ON CONFLICT (provider) DO UPDATE SET 
    tier = EXCLUDED.tier, 
    supports_backfill = EXCLUDED.supports_backfill,
    supports_replay = EXCLUDED.supports_replay;

-- =============================================================================
-- 2. State Anomalies (Observability)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.state_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'order', 'payment', 'customer'
    external_id TEXT NOT NULL,
    anomaly_type TEXT NOT NULL, -- 'missing_parent', 'version_mismatch'
    details JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.state_anomalies ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid duplicate error
DROP POLICY IF EXISTS "Org admins view anomalies" ON public.state_anomalies;
CREATE POLICY "Org admins view anomalies" ON public.state_anomalies 
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));

-- =============================================================================
-- 3. Idempotency Constraints (Epic B.2)
-- =============================================================================
-- Ensure normalized events are unique by derivation
-- We use (raw_event_id, canonical_type) as the uniqueness scope.
-- One raw event (e.g. checkout) might produce multiple canonicals (order, payment), but only one of each type.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_events_normalized_idempotency_key') THEN
        ALTER TABLE public.external_events_normalized
        ADD CONSTRAINT external_events_normalized_idempotency_key
        UNIQUE (raw_event_id, canonical_type);
    END IF;
END $$;

-- =============================================================================
-- 4. Views for Data Truth (Epic B.4 & B.5)
-- =============================================================================

-- Freshness View: When was the last time we heard from a provider?
DROP VIEW IF EXISTS public.integration_freshness_view CASCADE;
CREATE OR REPLACE VIEW public.integration_freshness_view AS
SELECT 
    org_id,
    provider,
    MAX(received_at) as last_raw_at,
    MAX(processed_at) as last_processed_at,
    EXTRACT(EPOCH FROM (NOW() - MAX(received_at))) as freshness_seconds,
    CASE 
        WHEN MAX(received_at) IS NULL THEN 'inactive'
        WHEN NOW() - MAX(received_at) < INTERVAL '1 hour' THEN 'healthy'
        WHEN NOW() - MAX(received_at) < INTERVAL '24 hours' THEN 'degraded'
        ELSE 'stale'
    END as status
FROM public.external_events_raw
GROUP BY org_id, provider;

-- Reconciliation Summary: High-level funnel metrics
DROP VIEW IF EXISTS public.reconciliation_summary_view CASCADE;
CREATE OR REPLACE VIEW public.reconciliation_summary_view AS
WITH raw_counts AS (
    SELECT org_id, provider, count(*) as total_raw 
    FROM public.external_events_raw GROUP BY org_id, provider
),
normalized_counts AS (
    SELECT org_id, provider, count(*) as total_normalized 
    FROM public.external_events_normalized GROUP BY org_id, provider
)
SELECT
    r.org_id,
    r.provider,
    COALESCE(r.total_raw, 0) as total_raw,
    COALESCE(n.total_normalized, 0) as total_normalized,
    (COALESCE(n.total_normalized, 0) - COALESCE(r.total_raw, 0)) as delta_count,
    ROUND((COALESCE(n.total_normalized, 0)::numeric / NULLIF(COALESCE(r.total_raw, 0), 0)) * 100, 2) as conversion_rate
FROM raw_counts r
FULL OUTER JOIN normalized_counts n ON r.org_id = n.org_id AND r.provider = n.provider;

-- =============================================================================
-- 5. Helper Function for Replay (Epic C.2)
-- =============================================================================
-- Logic handled in Typescript mostly, but we ensure Permissions here.
-- No new SQL function needed if we use simple select/insert with RLS.
