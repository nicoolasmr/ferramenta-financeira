
# Release Checklist v1.0.1

## Pre-Flight Checks
- [ ] **Lint & Typecheck**: `npm run lint && tsc --noEmit` ensures no regression.
- [ ] **Tests**: `npm test` passing (especially `contract.test.ts` for SDK).
- [ ] **Env Vars**: Verify `NEXT_PUBLIC_STRIPE_KEY` matches environment (Test vs Live).
- [ ] **Database**:
    - [ ] Migrations applied? (`supabase db push`)
    - [ ] RLS enabled on all new tables?

## Deployment (Vercel)
- [ ] **Build**: Check for "turbopack" errors in logs.
- [ ] **Cron**: Verify Cron Jobs are listed in Vercel Dashboard.
- [ ] **Edge Functions**: Confirm Middleware is running on Edge, APIs on Node.

## Post-Launch Verification
- [ ] **Ingestion**: Send a test webhook to `/api/webhooks/stripe`.
- [ ] **Logs**: Check `external_events_raw` for new row.
- [ ] **Worker**: Check `jobs_queue` for 'completed' status.
- [ ] **Dashboard**: Verify MRR update in `/app/ops`.

## Rollback Plan
- **Database**: `supabase db reset` (Dev only) or revert migration.
- **Code**: `git revert HEAD`.
