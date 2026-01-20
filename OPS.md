# Operations & Observability

## Webhooks
We store all inbound webhooks to ensure traceablity.
- **Table**: `webhook_inbox`
- **Flow**:
    1.  Receive HTTP POST.
    2.  Store raw payload immediately (Status: `pending`).
    3.  Process async or sync.
    4.  Update status to `processed` or `failed`.

## Sync Runs
For polling-based integrations or nightly jobs.
- **Table**: `sync_runs`
- **Metrics**: Start time, end time, items processed, error messages.

## Audit Logs
Immutable record of "who did what".
- **Structure**: `actor (user_id)`, `action` (verb), `target` (entity/id), `state_change` (before/after json).

## Reconciliation
Process to ensure data integrity between:
1.  **Internal Orders** (What we sold)
2.  **Payment Gateway** (What was captured)
3.  **Bank Payouts** (What was deposited)

Views will be created to highlight discrepancies (e.g., Order Paid but no Payment record).

## Financial Operations
Daily routines for the finance team.

- **Check Overdue Installments**:
  - Run `scripts/verify_patch.ts` (or check dashboard) daily.
  - Contact customers with >3 days overdue.

- **Renegotiation**:
  - Use the "Renegotiate" action in enrollment profile.
  - This marks old installments as 'Renegotiated' (archived) and creates a new schedule.
  - **Audit**: All renegotiations are logged in `audit_logs`.

- **Reconciliation**:
  - Weekly, run `npm run verify` to ensure View Data matches Atomic Data.

## Deployment & Safety (Patch v2)

### Deployment Checklist
1. **Pre-Deploy**:
   - [ ] Run `npm run build` locally.
   - [ ] Run `npm run verify` (Financial Consistency).
   - [ ] Run `npm test` (Unit Tests).
2. **Migration**:
   - [ ] Apply `supabase/migrations/20260122000000_patch_v2_storage.sql`.
   - [ ] Verify Storage Policies in Supabase Dashboard.
3. **Smoke Test**:
   - [ ] Login as Admin.
   - [ ] View Project Dashboard (KPIs loading?).
   - [ ] Check Enrollment Profile (Installments visible?).
   - [ ] Test "Mark Paid" on a test installment.

### Rollback Plan
If critical failure occurs:
1. **Revert Code**: `git revert HEAD` and push.
2. **Database**:
   - If SQL migration caused issues, policies can be dropped manually.
   - `DROP POLICY "Org Members can upload documents" ON storage.objects;`
   - `DROP POLICY "Users can download documents" ON storage.objects;`
