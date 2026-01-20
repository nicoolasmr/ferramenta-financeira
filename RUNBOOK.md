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

## 2. Onboarding New Connectors
1.  Add type to `IntegrationProvider` in `src/lib/integrations/normalizer.ts`.
2.  Implement `normalize[Provider]` function.
3.  Add UI Logic in `/app/app/integrations`.
4.  Update Docs.

## 3. Security Rotation
-   Re-encrypt integration configs if `ENCRYPTION_KEY_BASE64` changes (requires downtime script).

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
