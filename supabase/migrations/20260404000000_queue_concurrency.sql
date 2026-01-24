
-- Migration: Queue Hardening (Safe Concurrency)
-- Purpose: Add function for "SKIP LOCKED" polling to prevent race conditions.

CREATE OR REPLACE FUNCTION public.fetch_next_jobs(
    p_limit INTEGER DEFAULT 5
)
RETURNS SETOF public.jobs_queue
LANGUAGE plpgsql
AS $$
DECLARE
    v_ids UUID[];
BEGIN
    -- 1. Select IDs with lock
    WITH locked_rows AS (
        SELECT id
        FROM public.jobs_queue
        WHERE status = 'queued'
          AND available_at <= NOW()
        ORDER BY available_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    -- 2. Update status to 'running'
    UPDATE public.jobs_queue
    SET 
        status = 'running',
        updated_at = NOW()
    WHERE id IN (SELECT id FROM locked_rows)
    RETURNING *;
END;
$$;
