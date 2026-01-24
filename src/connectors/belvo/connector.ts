
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";
// import { syncBelvoLink } from "@/lib/belvo/sync"; // We might skip importing raw logic and reimplement here to fit SDK

export class BelvoConnector extends BaseConnector {
    provider: CanonicalProvider = "belvo";

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        // Belvo signature logic? 
        // For MVP we might trust the token bearer or just return true if not enforced yet.
        // Real implementation should check HMAC if available.
        return true;
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        return {
            provider: this.provider,
            event_type: body.type || 'unknown',
            payload: body,
            headers: headers,
            occurred_at: new Date() // Belvo payload has timestamps often, usually fallback to now
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        // Belvo webhooks are often just notifications "new transactions available" not the data itself.
        // So normalization here might yield 0 events, but trigger a "Sync Action".
        // HOWEVER, if the payload contains data (e.g. historical update), we normalize it.

        // Strategy: 
        // 1. If 'transactions_available', the pipeline should trigger a Side Effect (Sync).
        // The SDK as designed is Pure (Raw -> Canonical). It doesn't do async fetching.

        // Solution: we return a specialized Canonical Event "Data Sync Trigger"? 
        // Or we simply return empty here, and the "Ingest" step or a separate "Reactor" handles the trigger.

        // For now, let's assuming we only normalizing IF we have data.
        return [];
    }

    // Custom method to fetch and ingest? 
    // The SDK interface might need extension for "Poll/Fetch" providers vs "Push".
    // But for this MVP, we keep the existing `syncBelvoLink` logic separate or wrapped.
}
