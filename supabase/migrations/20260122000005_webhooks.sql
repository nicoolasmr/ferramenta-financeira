-- Create webhook endpoints table
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['invoice.paid', 'subscription.cancelled']
  secret TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_project ON webhook_endpoints(project_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Enable RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage webhooks for their projects" ON webhook_endpoints;
CREATE POLICY "Users can manage webhooks for their projects"
  ON webhook_endpoints FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'developer')
    )
  );

DROP POLICY IF EXISTS "Users can view deliveries for their webhooks" ON webhook_deliveries;
CREATE POLICY "Users can view deliveries for their webhooks"
  ON webhook_deliveries FOR SELECT
  USING (
    endpoint_id IN (
      SELECT we.id 
      FROM webhook_endpoints we
      JOIN projects p ON p.id = we.project_id
      JOIN organization_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );
