-- Migration: SaaS Core Transformation
-- Covers: Billing, Multi-tenant Core, Integration Engine, Business Data Unification

-- =============================================================================
-- 1. SaaS Core (Billing & Organization)
-- =============================================================================

-- Plans (Tiers)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'starter', 'pro', 'agency'
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'BRL',
    limits JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "projects": 5, "users": 2 }
    features JSONB NOT NULL DEFAULT '{}'::jsonb, -- [ "ai_analyst", "api_access" ]
    stripe_product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions (Stripe Mapping)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'stripe',
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    plan_id UUID REFERENCES public.plans(id),
    status TEXT NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled'
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id) -- One active subscription per org for MVP
);

-- Entitlements (Cached Limits)
CREATE TABLE IF NOT EXISTS public.entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings (Org Level)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    currency TEXT DEFAULT 'BRL',
    mask_pii BOOLEAN DEFAULT false,
    grace_days_default INTEGER DEFAULT 0,
    notification_prefs JSONB DEFAULT '{}'::jsonb,
    UNIQUE(org_id)
);

-- =============================================================================
-- 2. Integration Engine (The "Brain" of the Platform)
-- =============================================================================

-- Webhook Endpoints (Where we receive data)
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    endpoint_secret_ref TEXT, -- Reference to a secret stored in Vault/Env
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External Events Raw (Immutable Log)
-- Note: 'external_events' might already exist from Patch v3, we ensure strict structure here.
-- If exists, we alter.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'external_events_raw') THEN
        CREATE TABLE public.external_events_raw (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            provider TEXT NOT NULL,
            external_event_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload_json JSONB NOT NULL,
            headers_json JSONB,
            status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'ignored'
            error_text TEXT,
            received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(org_id, provider, external_event_id)
        );
    END IF;
END $$;

-- External Events Normalized (Canonical)
CREATE TABLE IF NOT EXISTS public.external_events_normalized (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    raw_event_id UUID REFERENCES public.external_events_raw(id),
    provider TEXT NOT NULL,
    canonical_type TEXT NOT NULL, -- 'order.created', 'payment.confirmed'
    canonical_payload JSONB NOT NULL,
    normalized_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync Jobs (Async Processing)
CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    job_type TEXT NOT NULL, -- 'backfill', 'incremental'
    status TEXT NOT NULL DEFAULT 'pending', -- 'running', 'completed', 'failed'
    range_start TIMESTAMP WITH TIME ZONE,
    range_end TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dead Letter Events (Failures)
CREATE TABLE IF NOT EXISTS public.dead_letter_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_event_id TEXT,
    reason TEXT,
    payload_dump JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. Business Data Unification (Updates)
-- =============================================================================

-- Ensure Customer Identities for multi-provider mapping
CREATE TABLE IF NOT EXISTS public.customer_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    external_customer_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, provider, external_customer_id)
);

-- Usage Events (Metering)
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'transaction_processed', 'analysis_run'
    quantity INTEGER DEFAULT 1,
    source TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. RLS & Security
-- =============================================================================

-- Plans (Public read, Admin write)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read plans" ON public.plans;
CREATE POLICY "Public read plans" ON public.plans FOR SELECT USING (true);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members view subscription" ON public.subscriptions;
CREATE POLICY "Org members view subscription" ON public.subscriptions FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
);

-- Entitlements
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members view entitlements" ON public.entitlements;
CREATE POLICY "Org members view entitlements" ON public.entitlements FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
);

-- Settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members view settings" ON public.settings;
CREATE POLICY "Org members view settings" ON public.settings FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Org admins update settings" ON public.settings;
CREATE POLICY "Org admins update settings" ON public.settings FOR UPDATE USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Helper function update
CREATE OR REPLACE FUNCTION public.check_org_access(org_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.memberships WHERE user_id = auth.uid() AND memberships.org_id = check_org_access.org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
