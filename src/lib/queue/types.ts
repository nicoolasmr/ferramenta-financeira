
import { NormalizedEvent } from "@/lib/integrations/sdk";

export type JobType =
    | 'normalize_event'
    | 'apply_event';

export interface BaseJob {
    id: string; // matches jobs_queue.id
    type: JobType;
    org_id: string;
    project_id: string;
}

export interface NormalizeEventJobPayload {
    raw_event_id: string; // UUID from external_events_raw
    provider: string;
}

export interface ApplyEventJobPayload {
    events: NormalizedEvent[];
}

export type JobPayload = NormalizeEventJobPayload | ApplyEventJobPayload;
