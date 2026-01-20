-- Migration: Ops Compliance (Billing Metering + Audit Logs)

-- =============================================================================
-- 1. Billing Metering (Epic D)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    resource TEXT NOT NULL, -- 'events_processed', 'seats', etc.
    period TEXT NOT NULL, -- '2026-02' (Monthly buckets)
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (org_id, resource, period)
);

ALTER TABLE public.usages ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid duplicate error
DROP POLICY IF EXISTS "Orgs view own usage" ON public.usages;
CREATE POLICY "Orgs view own usage" ON public.usages 
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));

-- Function to safely increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(p_org_id UUID, p_resource TEXT, p_period TEXT, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usages (org_id, resource, period, count)
    VALUES (p_org_id, p_resource, p_period, p_amount)
    ON CONFLICT (org_id, resource, period)
    DO UPDATE SET count = public.usages.count + p_amount, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 2. Audit Logs (Epic F)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE NO ACTION,
    actor_user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop policies if exist
DROP POLICY IF EXISTS "Read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Insert audit logs" ON public.audit_logs;

-- Recreate policies
CREATE POLICY "Read audit logs" ON public.audit_logs 
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));

-- Allow authenticated users to insert audit logs (application layer ensures actor_user_id is correct)
CREATE POLICY "Insert audit logs" ON public.audit_logs 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
