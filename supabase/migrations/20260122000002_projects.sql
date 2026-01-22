-- Create project environment and region enums
CREATE TYPE project_environment AS ENUM ('production', 'development', 'staging');
CREATE TYPE project_region AS ENUM ('gru1', 'us-east-1');

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure extended columns exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='slug') THEN
        ALTER TABLE public.projects ADD COLUMN slug TEXT NOT NULL DEFAULT 'default-' || (now())::text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='environment') THEN
        ALTER TABLE public.projects ADD COLUMN environment project_environment NOT NULL DEFAULT 'production';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='region') THEN
        ALTER TABLE public.projects ADD COLUMN region project_region NOT NULL DEFAULT 'gru1';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='settings') THEN
        ALTER TABLE public.projects ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='is_active') THEN
        ALTER TABLE public.projects ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='updated_at') THEN
        ALTER TABLE public.projects ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create project_api_keys table
CREATE TABLE IF NOT EXISTS project_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- 'sk_live_', 'sk_test_', 'pk_live_', 'pk_test_'
  key_hash TEXT NOT NULL UNIQUE,
  key_hint TEXT NOT NULL, -- Last 4 characters for display
  permissions JSONB DEFAULT '{"read": true, "write": true}'::jsonb,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_project_api_keys_project_id ON project_api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_project_api_keys_hash ON project_api_keys(key_hash) WHERE revoked_at IS NULL;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
DROP POLICY IF EXISTS "Users can view projects from their organizations" ON projects;
CREATE POLICY "Users can view projects from their organizations"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and admins can create projects" ON projects;
CREATE POLICY "Owners and admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners and admins can update projects" ON projects;
CREATE POLICY "Owners and admins can update projects"
  ON projects FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners can delete projects" ON projects;
CREATE POLICY "Owners can delete projects"
  ON projects FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for project_api_keys
DROP POLICY IF EXISTS "Users can view API keys for their projects" ON project_api_keys;
CREATE POLICY "Users can view API keys for their projects"
  ON project_api_keys FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and admins can manage API keys" ON project_api_keys;
CREATE POLICY "Owners and admins can manage API keys"
  ON project_api_keys FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = auth.uid() 
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_project_slug(project_name TEXT, org_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  base_slug := lower(regexp_replace(project_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM projects WHERE organization_id = org_id AND slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_project_id UUID,
  p_name TEXT,
  p_key_type TEXT DEFAULT 'secret' -- 'secret' or 'publishable'
)
RETURNS JSONB AS $$
DECLARE
  v_project RECORD;
  v_prefix TEXT;
  v_random_key TEXT;
  v_full_key TEXT;
  v_key_hash TEXT;
  v_key_hint TEXT;
  v_key_id UUID;
BEGIN
  -- Get project details
  SELECT p.*, p.environment INTO v_project
  FROM projects p
  WHERE p.id = p_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  -- Determine prefix based on environment and type
  IF p_key_type = 'publishable' THEN
    v_prefix := CASE 
      WHEN v_project.environment = 'production' THEN 'pk_live_'
      ELSE 'pk_test_'
    END;
  ELSE
    v_prefix := CASE 
      WHEN v_project.environment = 'production' THEN 'sk_live_'
      ELSE 'sk_test_'
    END;
  END IF;

  -- Generate random key (32 characters)
  v_random_key := encode(gen_random_bytes(24), 'base64');
  v_random_key := regexp_replace(v_random_key, '[^a-zA-Z0-9]', '', 'g');
  v_random_key := substring(v_random_key, 1, 32);
  
  v_full_key := v_prefix || v_random_key;
  v_key_hash := encode(digest(v_full_key, 'sha256'), 'hex');
  v_key_hint := substring(v_random_key, length(v_random_key) - 3, 4);

  -- Insert API key
  INSERT INTO project_api_keys (
    project_id,
    name,
    key_prefix,
    key_hash,
    key_hint,
    created_by
  ) VALUES (
    p_project_id,
    p_name,
    v_prefix,
    v_key_hash,
    v_key_hint,
    auth.uid()
  ) RETURNING id INTO v_key_id;

  -- Return the full key (only time it's visible)
  RETURN jsonb_build_object(
    'id', v_key_id,
    'key', v_full_key,
    'hint', v_key_hint,
    'prefix', v_prefix
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
