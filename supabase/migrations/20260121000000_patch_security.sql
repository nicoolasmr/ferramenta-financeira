-- PATCH: Security, Operations, and Financials

-- 1. ENUMS / CHECKS
-- Ensure 'renegotiated' is a valid status (if strict checks interfere, though logically mostly TEXT)
-- Also ensure 'client_viewer' role is handled.

-- 2. RLS UPDATES (Refined for Portal/RBAC)

-- Projects Policies
DROP POLICY IF EXISTS "Users can view projects in their org" ON public.projects;
DROP POLICY IF EXISTS "Admins/Owners can manage projects" ON public.projects;
-- Idempotency: Drop the new policies if they exist (to allow re-runs)
DROP POLICY IF EXISTS "View projects (Org Member or Project Member)" ON public.projects;
DROP POLICY IF EXISTS "Manage projects (Org Admin/Owner)" ON public.projects;

CREATE POLICY "View projects (Org Member or Project Member)" ON public.projects
FOR SELECT USING (
  -- User is generic Org Member
  (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()))
  OR
  -- User is specific Project Member (e.g. client_viewer)
  (id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid()))
);

CREATE POLICY "Manage projects (Org Admin/Owner)" ON public.projects
FOR ALL USING (
  org_id IN (
    SELECT org_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Enrollments Policies
DROP POLICY IF EXISTS "View enrollments in org" ON public.enrollments;
DROP POLICY IF EXISTS "Manage enrollments" ON public.enrollments;
-- Idempotency
DROP POLICY IF EXISTS "View enrollments (Org Member or Project Member)" ON public.enrollments;
DROP POLICY IF EXISTS "Manage enrollments (Org Admin/Owner)" ON public.enrollments;

CREATE POLICY "View enrollments (Org Member or Project Member)" ON public.enrollments
FOR SELECT USING (
  (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()))
  OR
  (project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid()))
);

CREATE POLICY "Manage enrollments (Org Admin/Owner)" ON public.enrollments
FOR ALL USING (
  org_id IN (
    SELECT org_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Payment Plans Policies
DROP POLICY IF EXISTS "View plans" ON public.payment_plans;
DROP POLICY IF EXISTS "Manage plans" ON public.payment_plans;
-- Idempotency
DROP POLICY IF EXISTS "View plans (Org Member or Project Member)" ON public.payment_plans;
DROP POLICY IF EXISTS "Manage plans (Org Admin/Owner)" ON public.payment_plans;

CREATE POLICY "View plans (Org Member or Project Member)" ON public.payment_plans
FOR SELECT USING (
  (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()))
  OR
  -- Implicitly via enrollment -> project member
  (enrollment_id IN (
      SELECT id FROM public.enrollments e 
      WHERE e.project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  ))
);

CREATE POLICY "Manage plans (Org Admin/Owner)" ON public.payment_plans
FOR ALL USING (
  org_id IN (
    SELECT org_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Installments Policies
DROP POLICY IF EXISTS "View installments" ON public.installments;
DROP POLICY IF EXISTS "Manage installments" ON public.installments;
-- Idempotency
DROP POLICY IF EXISTS "View installments (Org Member or Project Member)" ON public.installments;
DROP POLICY IF EXISTS "Manage installments (Org Admin/Owner)" ON public.installments;

CREATE POLICY "View installments (Org Member or Project Member)" ON public.installments
FOR SELECT USING (
  (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()))
  OR
  (plan_id IN (
     SELECT p.id FROM public.payment_plans p
     JOIN public.enrollments e ON p.enrollment_id = e.id
     WHERE e.project_id IN (SELECT project_id FROM public.project_members WHERE user_id = auth.uid())
  ))
);

CREATE POLICY "Manage installments (Org Admin/Owner)" ON public.installments
FOR ALL USING (
  org_id IN (
    SELECT org_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);


-- 3. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_enrollments_org_project ON public.enrollments(org_id, project_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_org_enrollment ON public.payment_plans(org_id, enrollment_id);
-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_installments_org_status_due ON public.installments(org_id, status, due_date);


-- 4. FINANCIAL CONSISTENCY (View)
DROP VIEW IF EXISTS public.project_financials_view CASCADE;
CREATE OR REPLACE VIEW public.project_financials_view AS
SELECT 
  p.id as project_id,
  p.org_id,
  p.name as project_name,
  
  -- Sold: Sum of all Payment Plans Total
  COALESCE(SUM(plans.total_amount_cents), 0) as total_sold,
  
  -- Received: Entry Paid + Installments Paid
  COALESCE(SUM(
    CASE WHEN plans.entry_status = 'paid' THEN plans.entry_amount_cents ELSE 0 END
  ), 0) + 
  COALESCE((
    SELECT SUM(i.amount_cents) 
    FROM public.installments i 
    JOIN public.payment_plans pp ON i.plan_id = pp.id 
    JOIN public.enrollments ee ON pp.enrollment_id = ee.id
    WHERE ee.project_id = p.id AND i.status = 'paid'
  ), 0) as total_received,
  
  -- Overdue: Installments Overdue
  COALESCE((
    SELECT SUM(i.amount_cents) 
    FROM public.installments i 
    JOIN public.payment_plans pp ON i.plan_id = pp.id 
    JOIN public.enrollments ee ON pp.enrollment_id = ee.id
    WHERE ee.project_id = p.id AND i.status = 'overdue'
  ), 0) as total_overdue,
  
  -- Open: Installments Pending (Future) + Overdue (Unpaid)
  COALESCE((
    SELECT SUM(i.amount_cents) 
    FROM public.installments i 
    JOIN public.payment_plans pp ON i.plan_id = pp.id 
    JOIN public.enrollments ee ON pp.enrollment_id = ee.id
    WHERE ee.project_id = p.id AND i.status IN ('pending', 'overdue')
  ), 0) as total_open

FROM public.projects p
LEFT JOIN public.enrollments e ON e.project_id = p.id
LEFT JOIN public.payment_plans plans ON plans.enrollment_id = e.id
GROUP BY p.id;

-- Grant access to the view
GRANT SELECT ON public.project_financials_view TO authenticated;
