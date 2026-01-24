
-- BILLING ENGINE SCHEMA

-- 1. PLANS ENUM (Hardcoded for simplicity, or table if dynamic needed)
CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'enterprise');

-- 2. SUBSCRIPTIONS (The Source of Truth)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    plan subscription_plan NOT NULL DEFAULT 'starter',
    status text NOT NULL DEFAULT 'active', -- active, past_due, canceled
    current_period_end timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    entitlements_override jsonb, -- Custom limits for Enterprise
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT subscriptions_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
    CONSTRAINT subscriptions_org_id_key UNIQUE (org_id) -- One active sub per org logic
);

-- 3. USAGE METERING (Aggregated by Month)
CREATE TABLE IF NOT EXISTS public.usage_events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    org_id uuid NOT NULL,
    period_month date NOT NULL, -- First day of month e.g. 2026-05-01
    
    -- Counters
    events_processed bigint DEFAULT 0,
    backfill_runs int DEFAULT 0,
    integrations_active int DEFAULT 0,
    seats_used int DEFAULT 0,
    
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT usage_events_pkey PRIMARY KEY (id),
    CONSTRAINT usage_events_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
    CONSTRAINT usage_events_org_period_key UNIQUE (org_id, period_month)
);

-- 4. ATOMIC INCREMENT FUNCTION (Concurrency Safe)
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_org_id uuid,
    p_metric text,
    p_amount int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_month date := date_trunc('month', now())::date;
BEGIN
    -- Ensure row exists
    INSERT INTO public.usage_events (org_id, period_month)
    VALUES (p_org_id, v_month)
    ON CONFLICT (org_id, period_month) DO NOTHING;

    -- Update based on metric
    IF p_metric = 'events_processed' THEN
        UPDATE public.usage_events 
        SET events_processed = events_processed + p_amount, updated_at = now()
        WHERE org_id = p_org_id AND period_month = v_month;
    ELSIF p_metric = 'backfill_runs' THEN
        UPDATE public.usage_events 
        SET backfill_runs = backfill_runs + p_amount, updated_at = now()
        WHERE org_id = p_org_id AND period_month = v_month;
    END IF;
END;
$$;

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Org Members can VIEW billing
CREATE POLICY "Org members can view subscriptions" ON public.subscriptions
    FOR SELECT USING (
        exists (
            select 1 from organization_members om 
            where om.org_id = subscriptions.org_id 
            and om.user_id = auth.uid()
        )
    );

CREATE POLICY "Org members can view usage" ON public.usage_events
    FOR SELECT USING (
        exists (
            select 1 from organization_members om 
            where om.org_id = usage_events.org_id 
            and om.user_id = auth.uid()
        )
    );
