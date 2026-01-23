-- Create filter_presets table
CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  page TEXT NOT NULL CHECK (page IN ('customers', 'transactions', 'sales', 'aging')),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, page, name)
);

-- Enable RLS
ALTER TABLE filter_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their org's filter presets" ON filter_presets;
CREATE POLICY "Users can view their org's filter presets"
  ON filter_presets FOR SELECT
  USING (is_org_member(org_id));

DROP POLICY IF EXISTS "Users can create filter presets in their org" ON filter_presets;
CREATE POLICY "Users can create filter presets in their org"
  ON filter_presets FOR INSERT
  WITH CHECK (is_org_member(org_id) AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own filter presets" ON filter_presets;
CREATE POLICY "Users can update their own filter presets"
  ON filter_presets FOR UPDATE
  USING (user_id = auth.uid() AND is_org_member(org_id));

DROP POLICY IF EXISTS "Users can delete their own filter presets" ON filter_presets;
CREATE POLICY "Users can delete their own filter presets"
  ON filter_presets FOR DELETE
  USING (user_id = auth.uid() AND is_org_member(org_id));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filter_presets_org_user ON filter_presets(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_filter_presets_page ON filter_presets(page);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_filter_presets_updated_at ON filter_presets;
CREATE TRIGGER update_filter_presets_updated_at
  BEFORE UPDATE ON filter_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
