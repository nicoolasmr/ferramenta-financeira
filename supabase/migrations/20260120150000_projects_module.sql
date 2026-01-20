-- Projects Module Migration

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT, -- External client name if applicable
  settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Project Members (RBAC for projects)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'client_viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_id)
);

-- 3. Enrollments (Link Customer <-> Project)
-- Note: 'customers' table already exists in initial schema.
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  
  -- Cycle / Status Details
  niche TEXT,
  status TEXT DEFAULT 'onboarding', -- e.g. Onboarding, Active, Completed, Churned
  situation TEXT DEFAULT 'active', -- e.g. Active, Paused, Canceled
  
  cycle_start_date DATE,
  cycle_end_date DATE,
  cycle_months INTEGER DEFAULT 1,
  
  -- Diagnosis & Onboarding
  initial_diagnosis TEXT,
  meeting1_at TIMESTAMP WITH TIME ZONE,
  meeting1_notes TEXT,
  followup_notes TEXT,
  folder_url TEXT,
  
  -- Contracts
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  contract_file_path TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Payment Plans
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  
  total_amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  
  -- Entry Payment
  entry_amount_cents INTEGER DEFAULT 0,
  entry_method TEXT, -- pix, card, boleto, transfer, etc
  entry_status TEXT DEFAULT 'pending', -- pending, paid
  entry_paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Installments Config
  installments_count INTEGER DEFAULT 0,
  installments_gateway TEXT, -- e.g. manual, asaas, stripe
  schedule_rule JSONB DEFAULT '{}'::JSONB, -- Stores rules for dates
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Installments
CREATE TABLE IF NOT EXISTS public.installments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  
  installment_number INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  due_date DATE NOT NULL,
  
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, renegotiated
  paid_at TIMESTAMP WITH TIME ZONE,
  method TEXT,
  external_id TEXT, -- For linking with Gateway ID provided usually in 'payments' table? Or direct here. 
                    -- MVP: Store external ID here for quick ref.
  receipt_file_path TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: 'audit_logs' already exists but lacks 'entity', 'entity_id', 'before', 'after' columns in the initial schema 
-- (based on my memory/assumption, checking initial schema showed generic structure). 
-- Let's ALTER it to support the new requirements if needed, or create a 'module_audit_logs'.
-- Initial schema 'audit_logs' had: id, org_id, actor_id, action, resource, details (jsonb), created_at.
-- We can map: resource -> entity:entity_id, details -> {before, after}. 
-- To be safe and strictly follow the prompt "audit_logs (org_id, user_id, action, entity, entity_id, before jsonb, after jsonb, created_at)",
-- I will create a new table specific for this module's enhanced auditing if the old one is too simple, 
-- OR better: ALTER the existing one to add specific columns for easier querying.
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS before_state JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS after_state JSONB;
-- If user_id was actor_id, we map it conceptually.

-- RLS POLICIES ==============================================================

-- Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view projects in their org" ON public.projects;
CREATE POLICY "Users can view projects in their org" ON public.projects
  FOR SELECT USING (
    org_id IN (
      SELECT m.org_id FROM public.memberships m WHERE m.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Admins/Owners can manage projects" ON public.projects;
CREATE POLICY "Admins/Owners can manage projects" ON public.projects
  FOR ALL USING (
    org_id IN (
      SELECT m.org_id FROM public.memberships m 
      WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
  );

-- Project Members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View project members" ON public.project_members;
CREATE POLICY "View project members" ON public.project_members
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );

-- Enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View enrollments in org" ON public.enrollments;
CREATE POLICY "View enrollments in org" ON public.enrollments
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Manage enrollments" ON public.enrollments;
CREATE POLICY "Manage enrollments" ON public.enrollments
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Payment Plans
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View plans" ON public.payment_plans;
CREATE POLICY "View plans" ON public.payment_plans
  FOR SELECT USING (
      org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Manage plans" ON public.payment_plans;
CREATE POLICY "Manage plans" ON public.payment_plans
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Installments
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "View installments" ON public.installments;
CREATE POLICY "View installments" ON public.installments
  FOR SELECT USING (
      org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Manage installments" ON public.installments;
CREATE POLICY "Manage installments" ON public.installments
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Indexes for performance
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(org_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_project ON public.enrollments(project_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_customer ON public.enrollments(customer_id);
CREATE INDEX IF NOT EXISTS idx_installments_plan ON public.installments(plan_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);
