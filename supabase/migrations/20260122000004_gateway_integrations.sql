-- Create gateway provider enum
CREATE TYPE gateway_provider AS ENUM ('stripe', 'hotmart', 'asaas', 'eduzz', 'kiwify', 'mercadopago');

-- Create gateway integrations table
CREATE TABLE IF NOT EXISTS gateway_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider gateway_provider NOT NULL,
  credentials JSONB NOT NULL, -- Encrypted API keys
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, provider)
);

-- Create gateway events table (webhook events)
CREATE TABLE IF NOT EXISTS gateway_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES gateway_integrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL, -- External event ID
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, event_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gateway_integrations_project ON gateway_integrations(project_id);
CREATE INDEX IF NOT EXISTS idx_gateway_events_integration ON gateway_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_gateway_events_processed ON gateway_events(processed_at) WHERE processed_at IS NULL;

-- Enable RLS
ALTER TABLE gateway_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gateway_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view integrations for their projects" ON gateway_integrations;
CREATE POLICY "Users can view integrations for their projects"
  ON gateway_integrations FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN memberships om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage integrations" ON gateway_integrations;
CREATE POLICY "Admins can manage integrations"
  ON gateway_integrations FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN memberships om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can view events for their integrations" ON gateway_events;
CREATE POLICY "Users can view events for their integrations"
  ON gateway_events FOR SELECT
  USING (
    integration_id IN (
      SELECT gi.id 
      FROM gateway_integrations gi
      JOIN projects p ON p.id = gi.project_id
      JOIN memberships om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );
