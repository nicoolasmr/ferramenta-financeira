
import { describe, it, expect } from "vitest";
import { normalizeAsaas } from "./normalize";
import paymentRefunded from "./fixtures/payment_refunded.json";

describe("Asaas Connector Contract", () => {
    it("should normalize PAYMENT_REFUNDED correctly", () => {
        const raw = {
            project_id: "test_proj",
            payload: paymentRefunded,
            occurred_at: new Date()
        };

        const events = normalizeAsaas(raw as any);

        expect(events.length).toBe(2); // Refund + Payment Update

        const refundEvent = events.find(e => e.domain_type === "refund");
        expect(refundEvent).toBeDefined();
        expect(refundEvent?.data.amount_cents).toBe(10000);

        const paymentEvent = events.find(e => e.domain_type === "payment");
        expect(paymentEvent).toBeDefined();
        expect(paymentEvent?.data.status).toBe("refunded");
    });
});
