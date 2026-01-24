-- Migration: Resilience Queue (Jobs)
-- Purpose: Async processing for scalable webhooks and background tasks.

CREATE TABLE IF NOT EXISTS public.jobs_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    job_type TEXT NOT NULL, -- 'sync_provider', 'apply_event', 'consistency_run', 'copilot_run'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'running', 'completed', 'failed', 'dead'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    trace_id TEXT, -- For observability correlation
    available_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- For delayed execution / backoff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for Worker Polling
CREATE INDEX IF NOT EXISTS idx_jobs_queue_poll ON public.jobs_queue(status, available_at) 
WHERE status IN ('queued', 'running'); -- Partial index for speed

CREATE INDEX IF NOT EXISTS idx_jobs_queue_org ON public.jobs_queue(org_id);

-- RLS
ALTER TABLE public.jobs_queue ENABLE ROW LEVEL SECURITY;

-- Only system/worker needs high privilege, but for debugging, Org Owners can view their jobs.
DROP POLICY IF EXISTS "Org members can view own jobs" ON public.jobs_queue;
CREATE POLICY "Org members can view own jobs" ON public.jobs_queue
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_queue_modtime ON public.jobs_queue;
CREATE TRIGGER update_jobs_queue_modtime BEFORE UPDATE ON public.jobs_queue FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
