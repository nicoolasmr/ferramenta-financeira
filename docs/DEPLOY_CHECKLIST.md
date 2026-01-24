
# Deployment Checklist - Production

## Environment Variables
Ensure these are set in Vercel/Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role (backend only).
- `CRON_SECRET`: Random string for securing cron jobs.
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking.
- `NEXT_PUBLIC_APP_URL`: The production URL (e.g. `https://app.revenueos.com`).

## Release Validation
- [ ] **Migrations**: All migrations in `supabase/migrations` applied?
- [ ] **Observability**: `x-request-id` appearing in headers?
- [ ] **Connectors**: 
    - Asaas webhook token set in DB (`project_secrets`).
    - Kiwify webhook token set in DB.
- [ ] **Workers**:
    - `/api/cron/worker` configured to run every minute (Vercel Cron).
    - `/api/cron/retention` configured to run daily.

## Operations (Smoke Test)
1. Send a Test Webhook to `/api/webhooks/asaas?key=...`.
2. Check `/ops/queue`: Should see job 'queued' then 'completed'.
3. Check `/ops/overview`: Success rate should be 100%.
4. Check `/ops/consistency`: No new critical anomalies.

## Security
- [ ] Verify `project_secrets` RLS policies (Owner only).
- [ ] Verify Webhook Router rejects invalid signatures (400/200 OK + Ignored).
