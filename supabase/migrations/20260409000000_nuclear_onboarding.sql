-- 1. Drop the harmful trigger that relies on auth.uid()
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
DROP FUNCTION IF EXISTS add_creator_as_owner();

-- 2. Create a Robust RPC for atomic onboarding
CREATE OR REPLACE FUNCTION public.create_onboarding_package(
    p_user_id UUID,
    p_org_name TEXT,
    p_org_slug TEXT,
    p_project_name TEXT,
    p_plan_code TEXT,
    p_integration TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
    v_org_id UUID;
    v_project_id UUID;
    v_plan_id UUID;
BEGIN
    -- [SELF-HEALING] Delete zombie organization if it exists (Same slug, 0 members)
    DELETE FROM organizations 
    WHERE slug = p_org_slug 
    AND id NOT IN (SELECT DISTINCT org_id FROM memberships);

    -- A. Create Organization
    INSERT INTO organizations (name, slug)
    VALUES (p_org_name, p_org_slug)
    RETURNING id INTO v_org_id;

    -- B. Create Membership (Explicit User ID)
    INSERT INTO memberships (org_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner');

    -- C. Create Settings
    INSERT INTO settings (org_id, currency, timezone)
    VALUES (v_org_id, 'BRL', 'America/Sao_Paulo');

    -- D. Create Project
    INSERT INTO projects (org_id, name)
    VALUES (v_org_id, p_project_name)
    RETURNING id INTO v_project_id;

    -- E. Setup Billing (Find Plan -> Insert Subscription)
    SELECT id INTO v_plan_id FROM plans WHERE code = p_plan_code LIMIT 1;
    
    -- Fallback to 'starter' if plan not found (or handle error)
    IF v_plan_id IS NULL THEN
         SELECT id INTO v_plan_id FROM plans WHERE code = 'starter' LIMIT 1;
    END IF;

    IF v_plan_id IS NOT NULL THEN
        INSERT INTO subscriptions (org_id, plan_id, status, provider)
        VALUES (v_org_id, v_plan_id, 'active', 'stripe');
    END IF;

    -- F. Setup Integration (if provided)
    IF p_integration IS NOT NULL AND p_integration <> 'skip' AND p_integration <> '' THEN
        INSERT INTO gateway_integrations (project_id, provider, name, status, credentials)
        VALUES (v_project_id, LOWER(p_integration), p_integration, 'active', '{}'::jsonb);
    END IF;

    -- Return the Org ID to redirect
    RETURN jsonb_build_object(
        'org_id', v_org_id,
        'project_id', v_project_id,
        'success', true
    );

EXCEPTION WHEN OTHERS THEN
    -- Propagate error clearly
    RAISE EXCEPTION 'Onboarding Failed: %', SQLERRM;
END;
$$;
