-- Create AI Copilot suggestions table
CREATE TABLE IF NOT EXISTS copilot_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL, -- 'churn_risk', 'payment_retry', 'upsell_opportunity'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  action_data JSONB,
  dismissed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure correct column name in audit_logs (idempotent rename)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_logs' AND column_name='organization_id') THEN
        ALTER TABLE public.audit_logs RENAME COLUMN organization_id TO org_id;
    END IF;
END $$;

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  grace_period_days INT DEFAULT 7,
  rate_limit_per_minute INT DEFAULT 60,
  rate_limit_per_hour INT DEFAULT 1000,
  auto_retry_failed_payments BOOLEAN DEFAULT TRUE,
  max_retry_attempts INT DEFAULT 3,
  settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_project ON copilot_suggestions(project_id) WHERE dismissed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_settings_project ON system_settings(project_id);

-- Enable RLS
ALTER TABLE copilot_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view copilot suggestions for their projects" ON copilot_suggestions;
CREATE POLICY "Users can view copilot suggestions for their projects"
  ON copilot_suggestions FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN memberships om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view audit logs for their organizations" ON audit_logs;
CREATE POLICY "Users can view audit logs for their organizations"
  ON audit_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings"
  ON system_settings FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN memberships om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    org_id,
    user_id,
    action,
    resource_type,
    resource_id,
    metadata
  ) VALUES (
    p_org_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
