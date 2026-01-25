-- Customer Identity Merge & Ledger Robustness
-- 1. Function to merge customers based on email
CREATE OR REPLACE FUNCTION public.handle_customer_identity()
RETURNS TRIGGER AS $$
DECLARE
    existing_id UUID;
BEGIN
    -- Only merge if email is provided
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        -- Check if another customer with same email exists in the same org
        SELECT id INTO existing_id 
        FROM public.customers 
        WHERE email = NEW.email 
        AND org_id = NEW.org_id 
        AND id != NEW.id
        LIMIT 1;

        IF existing_id IS NOT NULL THEN
            -- Instead of inserting a duplicate, we should ideally point everything to the old one.
            -- However, in a trigger on INSERT, we can't easily cancel.
            -- Strategy: In a real Ledger, we would have a 'canonical_customer_id'.
            -- For MVP: We will let the app layer handle the query logic via a view that groups by email.
            -- But we can at least tag them.
            NEW.tags = NEW.tags || '["identity_merged"]'::jsonb;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for automated merge tagging
DROP TRIGGER IF EXISTS tr_customer_identity ON public.customers;
CREATE TRIGGER tr_customer_identity
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_customer_identity();

-- 3. Create a Consolidated Customer View for LTV
CREATE OR REPLACE VIEW public.customer_ltv_view AS
SELECT 
    email,
    org_id,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen,
    COUNT(DISTINCT id) as source_count,
    SUM((SELECT COALESCE(SUM(gross_amount_cents), 0) FROM public.orders WHERE customer_id IN (SELECT id FROM public.customers c2 WHERE c2.email = public.customers.email))) as total_ltv_cents
FROM public.customers
WHERE email IS NOT NULL
GROUP BY email, org_id;
