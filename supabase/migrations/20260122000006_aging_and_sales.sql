-- Create aging reports table
CREATE TABLE IF NOT EXISTS aging_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  days_1_30_amount DECIMAL(12,2) DEFAULT 0,
  days_31_60_amount DECIMAL(12,2) DEFAULT 0,
  days_61_90_amount DECIMAL(12,2) DEFAULT 0,
  days_90_plus_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, report_date)
);

-- Create sales stages table
CREATE TABLE IF NOT EXISTS sales_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, order_index)
);

-- Create sales opportunities table
CREATE TABLE IF NOT EXISTS sales_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES sales_stages(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  value DECIMAL(12,2),
  probability INT DEFAULT 50,
  expected_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_aging_reports_project ON aging_reports(project_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_stages_project ON sales_stages(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sales_opportunities_project ON sales_opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_opportunities_stage ON sales_opportunities(stage_id);

-- Enable RLS
ALTER TABLE aging_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view data for their projects" ON aging_reports;
CREATE POLICY "Users can view data for their projects"
  ON aging_reports FOR SELECT
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage sales data for their projects" ON sales_stages;
CREATE POLICY "Users can manage sales data for their projects"
  ON sales_stages FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can manage opportunities for their projects" ON sales_opportunities;
CREATE POLICY "Users can manage opportunities for their projects"
  ON sales_opportunities FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN organization_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()
    )
  );
