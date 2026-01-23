-- Migration: Automated Reconciliation
-- Description: Create table for storing bank transactions (OFX imports) and linking them to payments

DO $$ BEGIN
    CREATE TYPE bank_transaction_status AS ENUM ('pending', 'matched', 'ignored');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    transaction_id TEXT NOT NULL, -- FITID from OFX (to prevent duplicates)
    memo TEXT, -- Additional info from OFX
    
    status bank_transaction_status DEFAULT 'pending',
    match_id UUID REFERENCES public.payments(id) ON DELETE SET NULL, -- Linked system payment
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint to prevent duplicate import of same transaction within an org
    UNIQUE(org_id, transaction_id)
);

-- RLS Policies
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "BankTransactions_Select" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Select" ON public.bank_transactions FOR SELECT
USING (org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "BankTransactions_Insert" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Insert" ON public.bank_transactions FOR INSERT
WITH CHECK (org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "BankTransactions_Update" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Update" ON public.bank_transactions FOR UPDATE
USING (org_id IN (SELECT get_my_org_ids()));

DROP POLICY IF EXISTS "BankTransactions_Delete" ON public.bank_transactions;
CREATE POLICY "BankTransactions_Delete" ON public.bank_transactions FOR DELETE
USING (org_id IN (SELECT get_my_org_ids()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_transactions_org_date ON public.bank_transactions(org_id, date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status ON public.bank_transactions(org_id, status);
