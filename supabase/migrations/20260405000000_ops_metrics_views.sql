-- Migration: Ops Metrics Views
-- Purpose: Provide real-time data for SLO Dashboard without complex Application queries.

-- 1. Webhook Success Rate (Last 24h)
-- Assumes we have 'integration_runs' or we infer from 'jobs_queue' if distinct
-- Ideally we'd have a 'webhook_logs' table. Since we didn't explicitly spec it in this chat history 
-- but we have 'jobs_queue', let's use jobs_queue stats for 'sync_provider' or 'apply_event'.
-- Or assuming we log raw events to `provider_events_raw` (implied in webhook router discussions).
-- Let's create a view based on 'jobs_queue' for now as proxy for system health.

CREATE OR REPLACE VIEW public.ops_queue_health_view AS
SELECT
    COUNT(*) FILTER (WHERE status = 'queued') as backlog_count,
    COUNT(*) FILTER (WHERE status = 'dead') as dead_letter_count,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'queued'))), 0) as oldest_age_seconds
FROM public.jobs_queue;

-- 2. Webhook / Job Success Rate (Last 24h)
CREATE OR REPLACE VIEW public.ops_job_success_view AS
WITH stats AS (
    SELECT
        job_type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as success,
        COUNT(*) FILTER (WHERE status = 'dead' OR (status = 'failed' AND attempts >= max_attempts)) as failed
    FROM public.jobs_queue
    WHERE created_at > NOW() - INTERVAL '24 hours'
    GROUP BY job_type
)
SELECT
    job_type,
    total,
    success,
    failed,
    CASE WHEN total = 0 THEN 100 ELSE ROUND((success::numeric / total::numeric) * 100, 2) END as success_rate
FROM stats;

-- 3. Consistency / Anomalies (Open Count)
CREATE OR REPLACE VIEW public.ops_anomalies_view AS
SELECT
    COUNT(*) as open_anomalies,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_anomalies
FROM public.state_anomalies -- Assuming this table exists from previous context
WHERE status = 'open';
