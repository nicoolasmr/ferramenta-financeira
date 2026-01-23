-- Migration: Risk Hub Core
-- Sprint 4 - RevenueOS v2.1

-- 1. Risk Events (Normalized)
CREATE TABLE IF NOT EXISTS public.risk_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('REFUND_REQUESTED', 'REFUNDED', 'CHARGEBACK_OPENED', 'CHARGEBACK_WON', 'CHARGEBACK_LOST', 'SUBSCRIPTION_CANCELED')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    amount_cents BIGINT,
    external_event_id TEXT,
    payload JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for risk_events
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view risk events in their org" ON public.risk_events
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 2. Risk Scores
CREATE TABLE IF NOT EXISTS public.risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    factors JSONB, -- list of reasons for this score
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, customer_id, project_id)
);

-- RLS for risk_scores
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view risk scores in their org" ON public.risk_scores
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 3. Risk Alerts
CREATE TABLE IF NOT EXISTS public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'ignored')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- RLS for risk_alerts
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view risk alerts in their org" ON public.risk_alerts
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));
