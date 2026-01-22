
-- Fix Recursion in Memberships RLS
-- This migration breaks the infinite loop by introducing a SECURITY DEFINER function
-- and updating policies to use it. It also ensures 'customers' table uses 'org_id'.

-- 1. Create a secure helper function to get user's org IDs without triggering RLS
CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  -- Direct query to memberships bypassing RLS because this function is SECURITY DEFINER
  -- However, to be safe, we perform the query directly on the table.
  RETURN QUERY SELECT org_id FROM public.memberships WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop the recursive policies on memberships
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.memberships;
DROP POLICY IF EXISTS "Users can view org memberships" ON public.memberships;
DROP POLICY IF EXISTS "Members can view org memberships" ON public.memberships;

-- 3. Create non-recursive policies
-- Drop potentially conflicting policies first to ensure idempotency
DROP POLICY IF EXISTS "Users can view own membership" ON public.memberships;
DROP POLICY IF EXISTS "Users can view org teammates" ON public.memberships;
-- Policy 1: I can see my own membership
CREATE POLICY "Users can view own membership" ON public.memberships
FOR SELECT USING (user_id = auth.uid());

-- Policy 2: I can see other members if we share an org (using the secure helper)
CREATE POLICY "Users can view org teammates" ON public.memberships
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 4. Update is_org_member to be safe
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the given org_id is in the list of my orgs
  RETURN EXISTS (SELECT 1 FROM public.memberships WHERE memberships.org_id = $1 AND memberships.user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Fix Customers Table Columns (Legacy Cleanup)
DO $$
BEGIN
    -- Check if 'customers' has 'organization_id' and rename it to 'org_id'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='customers' AND column_name='organization_id') THEN
        ALTER TABLE public.customers RENAME COLUMN organization_id TO org_id;
    END IF;

    -- Do the same for 'projects' just in case
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='projects' AND column_name='organization_id') THEN
        ALTER TABLE public.projects RENAME COLUMN organization_id TO org_id;
    END IF;
END $$;
