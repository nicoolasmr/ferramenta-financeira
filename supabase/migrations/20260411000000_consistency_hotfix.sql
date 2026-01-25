-- Consistency & RLS Hotfix (V2)
-- 1. Fix Sales Opportunities Structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_opportunities' AND column_name = 'org_id') THEN
        ALTER TABLE public.sales_opportunities ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        -- Backfill org_id from projects if possible
        UPDATE public.sales_opportunities so
        SET org_id = p.org_id
        FROM public.projects p
        WHERE so.project_id = p.id;
        
        -- Make it NOT NULL for future
        -- ALTER TABLE public.sales_opportunities ALTER COLUMN org_id SET NOT NULL;
    END IF;
END $$;

-- 2. Definitively Fix Membership RLS Recursion
-- Drop ALL previous policies on memberships
DROP POLICY IF EXISTS "Members can view org memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.memberships;
DROP POLICY IF EXISTS "Users can view org memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own membership" ON public.memberships;
DROP POLICY IF EXISTS "Users can view org teammates" ON public.memberships;

-- Policy A: See yourself
CREATE POLICY "memberships_see_self" ON public.memberships
FOR SELECT USING (user_id = auth.uid());

-- Policy B: See teammates via SECURITY DEFINER function (to avoid recursion)
CREATE OR REPLACE FUNCTION public.check_is_teammate(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE org_id = p_org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE POLICY "memberships_see_teammates" ON public.memberships
FOR SELECT USING (public.check_is_teammate(org_id));

-- 3. Update Sales Opportunities RLS
DROP POLICY IF EXISTS "Users can manage opportunities for their projects" ON public.sales_opportunities;
CREATE POLICY "Users can manage opportunities for their organization"
ON public.sales_opportunities FOR ALL
USING (
  org_id IN (
    SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
  )
);

-- 4. Ensure Projects RLS is robust
DROP POLICY IF EXISTS "Users can view projects from their organizations" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT USING (
  org_id IN (
    SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
  )
);
