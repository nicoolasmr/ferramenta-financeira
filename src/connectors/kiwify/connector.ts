
import { BaseConnector } from "@/connectors/sdk/core";
import { CanonicalEvent, CanonicalProvider } from "@/lib/contracts/canonical";
import { RawEvent } from "@/connectors/sdk/types";
import { normalizeKiwify } from "./normalize";
import { verifySignature } from "./verifySignature";

export class KiwifyConnector extends BaseConnector {
    provider: CanonicalProvider = "kiwify";

    verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
        return verifySignature(body, headers, secret);
    }

    parseWebhook(body: any, headers: Record<string, string>): RawEvent {
        return {
            provider: this.provider,
            event_type: body.order_status || "unknown", // Kiwify uses order_status often
            payload: body,
            headers: headers,
            occurred_at: new Date() // Kiwify payload might have it, default now
        };
    }

    normalize(raw: RawEvent): CanonicalEvent[] {
        return normalizeKiwify(raw);
    }
}
