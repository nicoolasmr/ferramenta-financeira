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
-   Rotate `STRIPE_WEBHOOK_SECRET` quarterly.
-   Rotate `SUPABASE_SERVICE_ROLE_KEY` if leaked.
-   Re-encrypt integration configs if `ENCRYPTION_KEY_BASE64` changes (requires downtime script).
