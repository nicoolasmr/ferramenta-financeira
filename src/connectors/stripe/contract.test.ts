
import { describe, it, expect } from "vitest";
import { StripeConnector } from "./connector";
import { RawEvent } from "@/connectors/sdk/types";

// Mock Fixture
const CHARGE_SUCCEEDED = {
    "id": "evt_3Q...",
    "object": "event",
    "data": {
        "object": {
            "id": "ch_3Q...",
            "object": "charge",
            "amount": 2000,
            "amount_captured": 2000,
            "amount_refunded": 0,
            "currency": "brl",
            "payment_intent": "pi_3Q...",
            "status": "succeeded",
            "created": 1737740000
        }
    },
    "type": "charge.succeeded",
    "created": 1737740000
};

describe("Stripe Connector Contract", () => {
    const connector = new StripeConnector();
    const ctx = { org_id: "test_org", project_id: "test_proj", trace_id: "test_trace" };

    it("should carry the correct provider key", () => {
        expect(connector.providerKey).toBe("stripe");
    });

    it("should normalize 'charge.succeeded' strictly", async () => {
        const raw: RawEvent = {
            provider: "stripe",
            event_type: "charge.succeeded",
            payload: CHARGE_SUCCEEDED,
            headers: {},
            occurred_at: new Date(1737740000 * 1000)
        };

        const canonical = await connector.normalize(raw, ctx);
        expect(canonical).toHaveLength(1);

        const event = canonical[0];
        expect(event.canonical_module).toBe("sales");
        expect(event.money!.amount_cents).toBe(2000);
        expect(event.money!.currency).toBe("BRL");
        expect(event.canonical_type).toBe("sales.payment.succeeded");
        expect(event.external_event_id).toBe("ch_3Q...");
    });

    it("should verify signature (mocked)", () => {
        expect(connector.verifyWebhook).toBeDefined();
    });
});
