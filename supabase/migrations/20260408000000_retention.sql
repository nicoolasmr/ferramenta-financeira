
-- RETENTION POLICY ENGINE

-- 1. FUNCTION to archive old raw events
CREATE OR REPLACE FUNCTION public.archive_stale_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Move to 'archived_events' (if exists) or just delete for MVP if retention ended
    -- Policy: Keep raw events for 90 days for Pro, 30 for Starter.
    -- Here we implement a generic 90 day soft delete concept or status update.
    
    UPDATE public.external_events_raw
    SET status = 'archived', updated_at = now()
    WHERE created_at < now() - interval '90 days'
    AND status != 'archived';
    
    -- Log execution
    INSERT INTO public.jobs_queue (job_type, status, payload)
    VALUES ('system_maintenance', 'completed', '{"action": "archive_stale_events"}');
END;
$$;
