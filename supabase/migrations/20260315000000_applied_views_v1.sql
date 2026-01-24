    -- Migration: Applied Views v1.0 (Data Truth Layer)
    -- Purpose: Deterministic financial views based on Canonical Domain tables.

    -- 1. Project Financials View (The Truth)
    -- Replaces previous view based on internal enrollments only.
    -- Now aggregates ALL Orders and Payments (Stripe, Hotmart, etc.) + Internal Installments.

    DROP VIEW IF EXISTS public.project_financials_view CASCADE;

    CREATE OR REPLACE VIEW public.project_financials_view AS
    WITH project_orders AS (
        SELECT 
            project_id,
            COALESCE(SUM(gross_amount_cents), 0) as total_sold_cents,
            COUNT(*) as deal_count
        FROM public.orders
        WHERE status IN ('confirmed', 'paid', 'completed') -- Adjust based on Canonical Status
        GROUP BY project_id
    ),
    project_payments AS (
        SELECT 
            project_id,
            COALESCE(SUM(amount_cents), 0) as total_received_cents
        FROM public.payments
        WHERE status = 'paid'
        GROUP BY project_id
    ),
    project_receivables AS (
        -- Installments are Future/Open receivables.
        -- We assume 'installments' table is populated for external orders OR internal plans.
        -- If external connectors don't populate 'installments', we might rely on 'orders' due_date?
        -- For MVP, we stick to 'installments' for Overdue/Open if populated, or fallback.
        -- Let's assume the Sync Pipeline 'Apply' step generates installments for credit card subscriptions if needed?
        -- Or simplistic: Overdue = 0 for Stripe one-off.
        SELECT 
            p.id as project_id,
            COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'overdue'), 0) as total_overdue_cents,
            COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status IN ('pending', 'open', 'overdue')), 0) as total_open_cents
        FROM public.projects p
        LEFT JOIN public.enrollments e ON e.project_id = p.id -- Legacy/Internal path
        LEFT JOIN public.payment_plans pp ON pp.enrollment_id = e.id
        LEFT JOIN public.installments i ON i.plan_id = pp.id
        GROUP BY p.id
        -- Note: This part is 'Legacy' specific. Truly universal receivables require a universal 'installments' or 'invoices' table.
        -- For v3.0, we prioritize Sold/Received from Canonical. Receivables from Legacy.
    )
    SELECT 
        p.id as project_id,
        p.org_id,
        p.name as project_name,
        COALESCE(po.total_sold_cents, 0) as total_sold,
        COALESCE(pp.total_received_cents, 0) as total_received,
        COALESCE(pr.total_overdue_cents, 0) as total_overdue,
        COALESCE(pr.total_open_cents, 0) as total_open
    FROM public.projects p
    LEFT JOIN project_orders po ON po.project_id = p.id
    LEFT JOIN project_payments pp ON pp.project_id = p.id
    LEFT JOIN project_receivables pr ON pr.project_id = p.id;

    GRANT SELECT ON public.project_financials_view TO authenticated;

    -- 2. Reconciliation Summary View
    -- Compares Orders vs Payments vs Payouts vs Bank
    DROP VIEW IF EXISTS public.reconciliation_summary_view CASCADE;
    CREATE OR REPLACE VIEW public.reconciliation_summary_view AS
    WITH distinct_providers AS (
        SELECT project_id, org_id, provider FROM public.orders WHERE provider IS NOT NULL
        UNION
        SELECT project_id, org_id, provider FROM public.payments WHERE provider IS NOT NULL
        UNION
        SELECT project_id, org_id, provider FROM public.payouts WHERE provider IS NOT NULL
    )
    SELECT 
        dp.org_id,
        dp.project_id,
        dp.provider,
        -- Orders
        COALESCE((SELECT SUM(o.gross_amount_cents) FROM public.orders o WHERE o.project_id = dp.project_id AND o.provider = dp.provider AND o.status IN ('confirmed', 'paid')), 0) as expected_revenue,
        -- Payments (Gateway)
        COALESCE((SELECT SUM(pay.amount_cents) FROM public.payments pay WHERE pay.project_id = dp.project_id AND pay.provider = dp.provider AND pay.status = 'paid'), 0) as gateway_received,
        -- Payouts (Gateway -> Bank)
        COALESCE((SELECT SUM(pout.net_cents) FROM public.payouts pout WHERE pout.project_id = dp.project_id AND pout.provider = dp.provider AND pout.status = 'paid'), 0) as gateway_payouts,
        -- Bank (Belvo)
        COALESCE((
            SELECT SUM(btn.amount_cents)
            FROM public.bank_transactions_normalized btn 
            WHERE btn.org_id = dp.org_id 
            AND btn.project_id = dp.project_id
            AND btn.direction = 'credit'
        ), 0) as bank_received_total -- Note: This is per-project total, repeated for each provider row.
    FROM distinct_providers dp;

    GRANT SELECT ON public.reconciliation_summary_view TO authenticated;

    -- 3. Receivables Aging View (Updates existing or creates new)
    DROP VIEW IF EXISTS public.receivables_aging_view CASCADE;
    CREATE OR REPLACE VIEW public.receivables_aging_view AS
    SELECT 
        i.org_id,
        i.project_id,
        -- Buckets
        COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'overdue' AND i.due_date > NOW() - INTERVAL '30 days'), 0) as overdue_30,
        COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'overdue' AND i.due_date <= NOW() - INTERVAL '30 days' AND i.due_date > NOW() - INTERVAL '60 days'), 0) as overdue_60,
        COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'overdue' AND i.due_date <= NOW() - INTERVAL '60 days' AND i.due_date > NOW() - INTERVAL '90 days'), 0) as overdue_90,
        COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'overdue' AND i.due_date <= NOW() - INTERVAL '90 days'), 0) as overdue_90plus,
        COALESCE(SUM(i.amount_cents) FILTER (WHERE i.status = 'pending' OR i.status = 'open'), 0) as future_receivables
    FROM public.installments i
    GROUP BY i.org_id, i.project_id;

    GRANT SELECT ON public.receivables_aging_view TO authenticated;
