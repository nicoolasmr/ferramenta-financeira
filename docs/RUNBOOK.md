# RevenueOS Runbook (SaaS Ops)

## 1. Incident Response

### Webhook Failures
**Symptom**: Integration status checks failing or user complaints of missing data.
**Action**:
1.  Go to `/ops/overview` or `/app/integrations/[provider]`.
2.  Check Logs table for `failed` or `ignored` status.
3.  Trace `external_event_id` in logs.
4.  If logic error (500), fix code and Replay event (if provider supports) or manually re-inject payload via Postman.

### Billing Sync Issues
**Symptom**: User upgraded but plan shows "Starter".
**Action**:
1.  Check Stripe Dashboard > Webhooks > Failures.
2.  Check `subscriptions` table in Supabase.
3.  Manually update subscription status if needed:
    ```sql
    UPDATE subscriptions SET plan_id = (SELECT id FROM plans WHERE code='pro') WHERE org_id = 'ORG_UUID';
    ```

### AI Copilot Debugging
**Symptom**: AI gives hallucinations or says "No data".
**Action**:
1.  Check `ai_runs` table for the specific conversation.
2.  Verify `metadata` column for context injected.
3.  Check `integration_freshness_view` to ensure data layer is not stale.

## 2. Onboarding New Connectors
1.  Add type to `IntegrationProvider` in `src/lib/integrations/normalizer.ts`.
2.  Implement `normalize[Provider]` function.
3.  Add UI Logic in `/app/app/integrations` and `src/app/app/onboarding/page.tsx` (Step 3).
4.  Add Contract Tests in `src/connectors/[provider]/contract.test.ts`.
5.  Update Docs.

## 3. Collections & Reconciliation Procedures

### Data Reconciliation
**Purpose**: Verify if `external_events_raw` matches `external_events_normalized`.
**Action**:
1.  Navigate to `/app/projects/[id]/reconciliation`.
2.  Check for "Delta > 0".
3.  If Delta > 0, check `failed` events in `external_events` table.

### Managing Receivables (Overdue)
**Purpose**: View and contact defaulting customers.
**Action**:
1.  Navigate to `/app/projects/[id]/receivables`.
2.  Use the "Priority Collection List" to identify high-value/long-overdue items.
3.  Use "Friendly Reminder" templates (WhatsApp/Email).

## 4. Ops & Support Procedures

### Impersonation
**Purpose**: Access user account to debug issues.
**Action**:
1.  Navigate to `/ops/support/impersonate`.
2.  Enter User Email.
3.  Audit Log is automatically generated in `audit_logs` table.

### Data Exports
**Purpose**: Provide raw data to users upon request or for analysis.
**Action**:
1.  Navigate to `/app/exports`.
2.  Select "Customers" or "Payments".
3.  CSV is generated on-fly from Read Replica.

### Sync Engine
**Purpose**: Reprocess stuck events.
**Action**:
1.  Go to `/ops/webhooks`.
2.  Click "Run Sync" to process pending events.
3.  Click "Replay" on specific failed events.

## 5. RevenueOS Copilot (AI)

### Manual Recalculation
**Purpose**: Force update of health scores and insights.
**Action**:
1.  Go to `/app/copilot` (Portfolio Dashboard).
2.  Click "Recalculate Analysis" button (top right).
3.  Wait 5-10 seconds for page reload.

### Troubleshooting "Stale Data" Insight
**Symptom**: Copilot flags "Data feeds are slow (-10)" or "Stale (-25)".
**Action**:
1.  Check `integration_freshness_view` via Supabase Studio or Ops Overview.
2.  If `last_event_at` is > 24h, check Provider Webhooks (Stripe/Hotmart).
3.  Trigger a manual sync in `/ops/webhooks`.

## 6. Deployment (Vercel)
**Note**: CSS issues may require clean builds.
**Command**: `rm -rf .next && next build`
**Environment**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and service keys are set.
**Optional Env**: `OPENAI_API_KEY` (for GPT summaries).
