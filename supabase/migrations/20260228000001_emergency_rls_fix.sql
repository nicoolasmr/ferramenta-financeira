-- EMERGENCY RLS FIX
-- Standardizing all RLS policies to use the non-recursive 'get_my_org_ids()' helper.
-- This fixes infinite loading loops and "access restricted" errors caused by recursive policy checks.

-- 1. Ensure the helper exists and is performant (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_my_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT org_id FROM public.memberships WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Organizations
DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
CREATE POLICY "Users can view own organizations" ON public.organizations
FOR SELECT USING (
  id IN (SELECT get_my_org_ids())
);

-- 3. Customers
DROP POLICY IF EXISTS "Org members can view customers" ON public.customers;
CREATE POLICY "Org members can view customers" ON public.customers
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 4. Gateway Integrations (Critical for Dashboard/Onboarding) has project_id, not org_id
DROP POLICY IF EXISTS "Org members can view gateway_integrations" ON public.gateway_integrations;
CREATE POLICY "Org members can view gateway_integrations" ON public.gateway_integrations
FOR SELECT USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE org_id IN (SELECT get_my_org_ids())
  )
);

-- 5. Integrations (Legacy)
DROP POLICY IF EXISTS "Org owners/admins can view integrations" ON public.integrations;
CREATE POLICY "Org members can view integrations" ON public.integrations
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 6. Webhook Endpoints (Critical for Settings)
DROP POLICY IF EXISTS "Org members can view webhook_endpoints" ON public.webhook_endpoints;
CREATE POLICY "Org members can view webhook_endpoints" ON public.webhook_endpoints
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 7. Bank Transactions
DROP POLICY IF EXISTS "BankTransactions_Select" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Select" ON public.bank_transactions
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 8. Copilot Suggestions (Critical for layout)
DROP POLICY IF EXISTS "Users can view org suggestions" ON public.copilot_suggestions;
CREATE POLICY "Users can view org suggestions" ON public.copilot_suggestions
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 9. Filter Presets
DROP POLICY IF EXISTS "Users can view their org's filter presets" ON public.filter_presets;
CREATE POLICY "Users can view their org's filter presets" ON public.filter_presets
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 10. Audit Logs
DROP POLICY IF EXISTS "Org owners/admins can view logs" ON public.audit_logs;
CREATE POLICY "Org members can view logs" ON public.audit_logs
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

-- 11. Payments & Orders (High volume)
DROP POLICY IF EXISTS "Org members can view payments" ON public.payments;
CREATE POLICY "Org members can view payments" ON public.payments
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);

DROP POLICY IF EXISTS "Org members can view orders" ON public.orders;
CREATE POLICY "Org members can view orders" ON public.orders
FOR SELECT USING (
  org_id IN (SELECT get_my_org_ids())
);
