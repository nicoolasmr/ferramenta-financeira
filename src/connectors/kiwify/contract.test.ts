
import { describe, it, expect } from "vitest";
import { normalizeKiwify } from "./normalize";
import orderPaid from "./fixtures/order_paid.json";
import orderRefunded from "./fixtures/order_refunded.json";

describe("Kiwify Connector Contract", () => {
    it("should normalize PAID order correctly", () => {
        const raw = {
            project_id: "test_proj",
            payload: orderPaid,
            occurred_at: new Date()
        };

        const events = normalizeKiwify(raw as any);
        expect(events.length).toBe(2); // Order + Payment

        const order = events.find(e => e.domain_type === "order");
        expect(order).toBeDefined();
        expect(order?.data.total_cents).toBe(19700);
        expect(order?.data.status).toBe("confirmed");

        const payment = events.find(e => e.domain_type === "payment");
        expect(payment?.data.installments).toBe(12);
        expect(payment?.data.method).toBe("credit_card");
    });

    it("should normalize REFUNDED order correctly", () => {
        const raw = {
            project_id: "test_proj",
            payload: orderRefunded,
            occurred_at: new Date()
        };

        const events = normalizeKiwify(raw as any);
        expect(events.length).toBe(1); // Refund event

        const refund = events[0];
        expect(refund.domain_type).toBe("refund");
        expect(refund.data.amount_cents).toBe(4990);
    });
});
