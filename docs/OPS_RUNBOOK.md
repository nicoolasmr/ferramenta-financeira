
# RevenueOS Operations Runbook (v1.0.1)

**Specific procedures for SREs and On-Call Engineers.**

---

## 🚨 Incident Response

### Severity 1: Payments Not Syncing (Webhook Failure)
**Symptoms**: Users complain "I paid but dashboard is empty".
**Diagnosis**:
1. Check **Ingestion Latency** in Vercel/Ops Dashboard.
2. Filter `external_events_raw` for newest rows:
   ```sql
   SELECT * FROM external_events_raw ORDER BY received_at DESC LIMIT 10;
   ```
3. If no rows -> **Provider Issue** or **Vercel Down**.
4. If rows exist but `status='pending'` -> **Worker Down**.

**Mitigation**:
1. Restart Worker (Redeploy Vercel Project).
2. If Worker was completely dead, run manual backfill:
   `npm run job:backfill -- --hours=24`

### Severity 2: Dunning Spam (Double Send)
**Symptoms**: User gets 5 WhatsApps in 1 minute.
**Diagnosis**:
1. Check `dunning_logs` for `payment_id`. Are there duplicates?
   ```sql
   SELECT payment_id, count(*) FROM dunning_logs GROUP BY payment_id HAVING count(*) > 1;
   ```
2. If yes, **Idempotency Key Failure**.
**Mitigation**:
1. **Pause Cron**: Comment out cron in `vercel.json` and deploy.
2. **Apology**: Send email to affected `project_id`.

---

## 🛠️ Maintenance Tasks

### Database Vacuum
**Frequency**: Weekly (Automated) or Manual if slow.
```sql
VACUUM ANALYZE external_events_raw;
VACUUM ANALYZE external_events_normalized;
```

### Rotating Secrets
1. Generate new `INTERNAL_API_SECRET`.
2. Update Vercel Env Vars.
3. Update `vercel.json` Cron Headers.
4. Redeploy.

### Adding a New Provider
1. Follow `docs/PROVIDER_MATRIX.md`.
2. Run `script/create-connector.ts`.
3. Add to `src/connectors/registry.ts`.
4. Deploy to Staging.
5. Verify `verifyWebhook` works with real payload.

---

## 🔍 Debugging Tools

### Lineage Explorer
URL: `/app/ops/lineage`
- Input: `evt_...` or Customer Email.
- Output: Full lifecycle trace.

### Force Replay
To re-run the normalization logic on an old event:
```bash
# Local terminal connected to Prod DB
npm run script:replay-event -- --id="evt_123456"
```
