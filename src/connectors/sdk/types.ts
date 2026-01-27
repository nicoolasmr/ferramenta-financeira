
import { CanonicalProvider, CanonicalEvent, Environment } from "@/lib/contracts/canonical";

/**
 * Raw Event Structure
 * Represents the exact payload received from the provider's webhook.
 */
export interface RawEvent {
    provider: CanonicalProvider;
    event_type: string; // "charge.succeeded", "payment.created"
    payload: any; // The full JSON body
    headers: Record<string, string>;
    occurred_at: Date;
    verify_signature?: boolean;
    org_id?: string;
    project_id?: string;
}

/**
 * Connector Interface
 * Every provider integration must implement this contract.
 */
export interface Connector {
    provider: CanonicalProvider;

    /**
     * Verify webhook signature validity.
     */
    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean;

    /**
     * Parse the raw request into a standard RawEvent structure.
     * Extracts event ID, type, and timestamp.
     */
    parseWebhook(body: any, headers: Record<string, string>): RawEvent;

    /**
     * Normalize a RawEvent into one or more CanonicalEvents.
     * Pure function: Input Raw -> Output Canonical[]
     */
    normalize(raw: RawEvent): CanonicalEvent[];
}

/**
 * Pipeline Result
 */
export interface PipelineResult {
    raw_id: string; // UUID from external_events_raw
    canonical_ids: string[]; // UUIDs from external_events_normalized
    success: boolean;
    error?: string;
}
