-- 1. Create Receivables Table (Physical Source of Truth for Future Cashflow)
CREATE TABLE IF NOT EXISTS public.receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Linked for AI queries
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, anticipated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(payment_id, installment_number)
);

-- 2. Add Project ID to Orders (to propagate context)
-- Check if column exists first to be safe (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='project_id') THEN
        ALTER TABLE public.orders ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Indexes for AI Speed
CREATE INDEX IF NOT EXISTS idx_receivables_due_date ON receivables(org_id, due_date);
CREATE INDEX IF NOT EXISTS idx_receivables_project ON receivables(project_id);
CREATE INDEX IF NOT EXISTS idx_orders_project ON orders(project_id);

-- 4. Enable RLS
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view receivables" ON receivables;
CREATE POLICY "Org members can view receivables" ON receivables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.org_id = receivables.org_id
            AND memberships.user_id = auth.uid()
        )
    );

-- 5. FUNCTION: Explode Installments (The "Real Data" Generator)
CREATE OR REPLACE FUNCTION public.explode_installments()
RETURNS TRIGGER AS $$
DECLARE
    v_installment_amount INTEGER;
    v_remainder INTEGER;
    v_due_date DATE;
    i INTEGER;
    v_project_id UUID;
BEGIN
    -- Get project_id via order
    SELECT project_id INTO v_project_id FROM orders WHERE id = NEW.order_id;
    
    -- Calculation
    IF NEW.installments > 0 THEN
        v_installment_amount := NEW.amount_cents / NEW.installments;
        v_remainder := NEW.amount_cents % NEW.installments;
        
        FOR i IN 1..NEW.installments LOOP
            -- Add 30 days for each installment (Simple Logic)
            v_due_date := (NEW.created_at + (i * INTERVAL '30 days'))::DATE;
            
            -- Add remainder to first installment
            IF i = 1 THEN
                INSERT INTO receivables (org_id, project_id, payment_id, installment_number, total_installments, amount_cents, due_date, status)
                VALUES (NEW.org_id, v_project_id, NEW.id, i, NEW.installments, v_installment_amount + v_remainder, v_due_date, 'pending');
            ELSE
                INSERT INTO receivables (org_id, project_id, payment_id, installment_number, total_installments, amount_cents, due_date, status)
                VALUES (NEW.org_id, v_project_id, NEW.id, i, NEW.installments, v_installment_amount, v_due_date, 'pending');
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER
DROP TRIGGER IF EXISTS on_payment_created_explode ON payments;
CREATE TRIGGER on_payment_created_explode
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION explode_installments();
