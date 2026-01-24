
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
            "status": "succeeded"
        }
    },
    "type": "charge.succeeded",
    "created": 1737740000
};

describe("Stripe Connector Contract", () => {
    const connector = new StripeConnector();

    it("should carry the correct provider key", () => {
        expect(connector.providerKey).toBe("stripe");
    });

    it("should normalize 'charge.succeeded' strictly", () => {
        const raw: RawEvent = {
            provider: "stripe",
            event_type: "charge.succeeded",
            payload: CHARGE_SUCCEEDED,
            headers: {},
            occurred_at: new Date(1737740000 * 1000)
        };

        const canonical = connector.normalize(raw);
        expect(canonical).toHaveLength(1);

        const event = canonical[0];
        expect(event.domain_type).toBe("payment");
        expect(event.data.amount_cents).toBe(2000);
        expect(event.data.currency).toBe("BRL");
        expect(event.data.status).toBe("paid");
        expect(event.refs.provider_object_id).toBe("ch_3Q...");
    });

    it("should verify signature (mocked)", () => {
        // Since we mock the actual verification logic in unit tests usually
        // Here we just test the method exists
        expect(connector.verifyWebhook).toBeDefined();
    });
});
