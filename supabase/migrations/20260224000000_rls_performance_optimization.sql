-- RLS Performance Optimization Migration
-- This migration standardizes all RLS policies to use high-performance, non-recursive checks.
-- It also ensures the master admin has global access to all tables for support/ops.

-- 1. Ensure helper functions are updated and SECURE
CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT org_id FROM public.memberships WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE memberships.org_id = p_org_id 
    AND memberships.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Master Admin Bypass helper
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'nicoolascf5@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. ORGANIZATIONS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
DROP POLICY IF EXISTS "Master admin can view all organizations" ON public.organizations;
CREATE POLICY "Organizations_Select" ON public.organizations FOR SELECT
USING (is_master_admin() OR id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Master admin can update all organizations" ON public.organizations;
CREATE POLICY "Organizations_Update" ON public.organizations FOR UPDATE
USING (is_master_admin() OR id IN (SELECT get_my_org_ids()));


-- 4. MEMBERSHIPS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.memberships;
DROP POLICY IF EXISTS "Users can view own membership" ON public.memberships;
DROP POLICY IF EXISTS "Users can view org teammates" ON public.memberships;
DROP POLICY IF EXISTS "Master admin can view all memberships" ON public.memberships;
CREATE POLICY "Memberships_Select" ON public.memberships FOR SELECT
USING (is_master_admin() OR user_id = auth.uid() OR org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.memberships;
DROP POLICY IF EXISTS "Master admin can manage all memberships" ON public.memberships;
CREATE POLICY "Memberships_Manage" ON public.memberships FOR ALL
USING (is_master_admin() OR org_id IN (SELECT get_my_org_ids()));


-- 5. PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view projects from their organizations" ON public.projects;
DROP POLICY IF EXISTS "Master admin can view all projects" ON public.projects;
CREATE POLICY "Projects_Select" ON public.projects FOR SELECT
USING (is_master_admin() OR is_org_member(org_id));

DROP POLICY IF EXISTS "Owners and admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Master admin can manage all projects" ON public.projects;
CREATE POLICY "Projects_Manage" ON public.projects FOR ALL
USING (is_master_admin() OR is_org_member(org_id));


-- 6. CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org members can view customers" ON public.customers;
DROP POLICY IF EXISTS "Master admin can view all customers" ON public.customers;
CREATE POLICY "Customers_Select" ON public.customers FOR SELECT
USING (is_master_admin() OR is_org_member(org_id));

DROP POLICY IF EXISTS "Org members can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Master admin can manage all customers" ON public.customers;
CREATE POLICY "Customers_Manage" ON public.customers FOR ALL
USING (is_master_admin() OR is_org_member(org_id));


-- 7. PAYMENTS & ORDERS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org members can view payments" ON public.payments;
        DROP POLICY IF EXISTS "Master admin can view all payments" ON public.payments;
        CREATE POLICY "Payments_Select" ON public.payments FOR SELECT USING (is_master_admin() OR is_org_member(org_id));
        
        DROP POLICY IF EXISTS "Master admin can manage all payments" ON public.payments;
        CREATE POLICY "Payments_Manage" ON public.payments FOR ALL USING (is_master_admin() OR is_org_member(org_id));
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Org members can view orders" ON public.orders;
        CREATE POLICY "Orders_Select" ON public.orders FOR SELECT USING (is_master_admin() OR is_org_member(org_id));
        CREATE POLICY "Orders_Manage" ON public.orders FOR ALL USING (is_master_admin() OR is_org_member(org_id));
    END IF;
END $$;


-- 8. INTEGRATIONS & WEBHOOKS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org owners/admins can view integrations" ON public.integrations;
DROP POLICY IF EXISTS "Org owners/admins can manage integrations" ON public.integrations;
CREATE POLICY "Integrations_Select" ON public.integrations FOR SELECT USING (is_master_admin() OR is_org_member(org_id));
CREATE POLICY "Integrations_Manage" ON public.integrations FOR ALL USING (is_master_admin() OR is_org_member(org_id));

IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_inbox') THEN
    ALTER TABLE public.webhook_inbox ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Org owners/admins can view webhooks" ON public.webhook_inbox;
    CREATE POLICY "Webhooks_Select" ON public.webhook_inbox FOR SELECT USING (is_master_admin() OR is_org_member(org_id));
END IF;


-- 9. AUDIT LOGS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org owners/admins can view logs" ON public.audit_logs;
CREATE POLICY "Audit_Logs_Select" ON public.audit_logs FOR SELECT USING (is_master_admin() OR is_org_member(org_id));


-- 10. BILLING & SUBSCRIPTIONS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
        CREATE POLICY "Subscriptions_Select" ON public.subscriptions FOR SELECT USING (is_master_admin() OR is_org_member(org_id));
    END IF;
END $$;
