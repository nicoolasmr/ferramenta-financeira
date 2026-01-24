
# Operations Runbook

## Incidents Response

### 1. High Webhook Failure Rate
**Symptom**: `/ops/overview` shows Success Rate < 99%.
**Action**:
1. Check `/ops/queue`: Are jobs failing? Look at `last_error`.
2. If specific error (e.g. "Database timeout"): Check Supabase stats.
3. If logic error (e.g. "Missing order"): Check `trace_id` lineage.
4. **Fix**: Requeue dead jobs via UI after fixing root cause.

### 2. Queue Backlog Spam
**Symptom**: Queue Latency > 300s.
**Action**:
1. Check `/ops/queue`. Is there a specific `job_type` accumulating?
2. If `sync_provider` spam: Pause specific cron or integration.
3. Scale workers (increase batch size in `worker.ts` or frequency).

### 3. SLO Breach
**Symptom**: Dashboard shows Critical (Red).
**Action**:
1. Acknowledge incident in linear/jira.
2. Investigate using `request_id` in logs.
3. Post-mortem: Update `docs/RETROSPECTIVES.md`.

## Routine Maintenance
- **Daily**: Check `/ops/consistency` for anomalies (Orphan Payments).
- **Weekly**: Review Sentry issues for new patterns.
- **Monthly**: Review Retention policy execution log.
