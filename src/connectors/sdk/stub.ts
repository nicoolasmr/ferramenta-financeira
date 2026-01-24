
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";

export class StubConnector extends BaseConnector {
    constructor(public provider: CanonicalProvider) {
        super();
    }

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        return true; // Stub checks nothing
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        return {
            provider: this.provider,
            event_type: "stub.event",
            payload: body,
            headers: headers,
            occurred_at: new Date()
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        return [];
    }
}
