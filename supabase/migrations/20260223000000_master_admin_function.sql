-- Helper to check if user is the master admin (owner)
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Optimized: Check email from JWT claim to avoid expensive subqueries in RLS
  RETURN (auth.jwt() ->> 'email') = 'nicoolascf5@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update RLS policies across core tables to allow master admin access

-- 1. Organizations
DROP POLICY IF EXISTS "Master admin can view all organizations" ON public.organizations;
CREATE POLICY "Master admin can view all organizations"
  ON public.organizations FOR SELECT
  USING (is_master_admin());

DROP POLICY IF EXISTS "Master admin can update all organizations" ON public.organizations;
CREATE POLICY "Master admin can update all organizations"
  ON public.organizations FOR UPDATE
  USING (is_master_admin());

-- 2. Memberships
DROP POLICY IF EXISTS "Master admin can view all memberships" ON public.memberships;
CREATE POLICY "Master admin can view all memberships"
  ON public.memberships FOR SELECT
  USING (is_master_admin());

DROP POLICY IF EXISTS "Master admin can manage all memberships" ON public.memberships;
CREATE POLICY "Master admin can manage all memberships"
  ON public.memberships FOR ALL
  USING (is_master_admin());

-- 3. Projects
DROP POLICY IF EXISTS "Master admin can view all projects" ON public.projects;
CREATE POLICY "Master admin can view all projects"
  ON public.projects FOR SELECT
  USING (is_master_admin());

DROP POLICY IF EXISTS "Master admin can manage all projects" ON public.projects;
CREATE POLICY "Master admin can manage all projects"
  ON public.projects FOR ALL
  USING (is_master_admin());

-- 4. Customers
DROP POLICY IF EXISTS "Master admin can view all customers" ON public.customers;
CREATE POLICY "Master admin can view all customers"
  ON public.customers FOR SELECT
  USING (is_master_admin());

DROP POLICY IF EXISTS "Master admin can manage all customers" ON public.customers;
CREATE POLICY "Master admin can manage all customers"
  ON public.customers FOR ALL
  USING (is_master_admin());

-- 5. Sales & Payments (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        DROP POLICY IF EXISTS "Master admin can view all sales" ON public.sales;
        CREATE POLICY "Master admin can view all sales" ON public.sales FOR SELECT USING (is_master_admin());
        DROP POLICY IF EXISTS "Master admin can manage all sales" ON public.sales;
        CREATE POLICY "Master admin can manage all sales" ON public.sales FOR ALL USING (is_master_admin());
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        DROP POLICY IF EXISTS "Master admin can view all payments" ON public.payments;
        CREATE POLICY "Master admin can view all payments" ON public.payments FOR SELECT USING (is_master_admin());
        DROP POLICY IF EXISTS "Master admin can manage all payments" ON public.payments;
        CREATE POLICY "Master admin can manage all payments" ON public.payments FOR ALL USING (is_master_admin());
    END IF;
END $$;
