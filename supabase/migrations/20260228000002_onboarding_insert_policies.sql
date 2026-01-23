-- Migration: Add missing INSERT policies for onboarding flow
-- This allows authenticated users to create their own organizations, projects, and related entities.

-- 1. Organizations: Allow authenticated users to create organizations
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (true);

-- 2. Memberships: Allow authenticated users to create their own memberships (Owner)
DROP POLICY IF EXISTS "Users can create memberships" ON public.memberships;
CREATE POLICY "Users can create memberships" ON public.memberships
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Projects: Allow members to create projects in their organizations
DROP POLICY IF EXISTS "Org members can create projects" ON public.projects;
CREATE POLICY "Org members can create projects" ON public.projects
FOR INSERT TO authenticated
WITH CHECK (
  org_id IN (SELECT get_my_org_ids())
);

-- 4. Settings: Allow members to create settings for their organizations
DROP POLICY IF EXISTS "Org members can create settings" ON public.settings;
CREATE POLICY "Org members can create settings" ON public.settings
FOR INSERT TO authenticated
WITH CHECK (
  org_id IN (SELECT get_my_org_ids())
);

-- 5. Subscriptions: Allow members to create subscriptions for their organizations
DROP POLICY IF EXISTS "Org members can create subscriptions" ON public.subscriptions;
CREATE POLICY "Org members can create subscriptions" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (
  org_id IN (SELECT get_my_org_ids())
);

-- 6. Gateway Integrations: Allow members to create integrations for their projects
DROP POLICY IF EXISTS "Org members can create gateway_integrations" ON public.gateway_integrations;
CREATE POLICY "Org members can create gateway_integrations" ON public.gateway_integrations
FOR INSERT TO authenticated
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE org_id IN (SELECT get_my_org_ids())
  )
);
