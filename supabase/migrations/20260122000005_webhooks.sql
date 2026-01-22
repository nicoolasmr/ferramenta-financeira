-- Create webhook endpoints table
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['invoice.paid', 'subscription.cancelled']
  secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure correct column name in webhook_endpoints (idempotent rename)
-- This resolves the mismatch where the table was created with project_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='webhook_endpoints' AND column_name='project_id') THEN
        ALTER TABLE public.webhook_endpoints RENAME COLUMN project_id TO org_id;
    END IF;
    
    -- Ensure other columns exist if they were missing from a different version
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='webhook_endpoints' AND column_name='status') THEN
        ALTER TABLE public.webhook_endpoints ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Create webhook deliveries table
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  response_time_ms INT,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org ON public.webhook_endpoints(org_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON public.webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON public.webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage webhooks for their projects" ON public.webhook_endpoints;
CREATE POLICY "Users can manage webhooks for their organizations"
  ON public.webhook_endpoints FOR ALL
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.memberships 
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view deliveries for their webhooks" ON public.webhook_deliveries;
CREATE POLICY "Users can view deliveries for their webhooks"
  ON public.webhook_deliveries FOR SELECT
  USING (
    endpoint_id IN (
      SELECT we.id 
      FROM public.webhook_endpoints we
      WHERE we.org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
    )
  );
