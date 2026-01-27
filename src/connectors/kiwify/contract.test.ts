
import { describe, it, expect } from "vitest";
import { KiwifyConnector } from "./connector";
import orderPaid from "./fixtures/order_paid.json";
import orderRefunded from "./fixtures/order_refunded.json";

describe("Kiwify Connector Contract", () => {
    const connector = new KiwifyConnector();
    const ctx = { org_id: "test_org", project_id: "test_proj", trace_id: "test_trace" };

    it("should normalize PAID order correctly", async () => {
        const raw = {
            project_id: "test_proj",
            payload: orderPaid,
            occurred_at: new Date()
        };

        const events = await connector.normalize(raw as any, ctx);
        expect(events.length).toBe(1); // Order Paid

        const order = events.find(e => e.canonical_type === "sales.order.paid");
        expect(order).toBeDefined();
        expect(order!.money!.amount_cents).toBe(19700);
    });

    it("should normalize REFUNDED order correctly", async () => {
        const raw = {
            project_id: "test_proj",
            payload: orderRefunded,
            occurred_at: new Date()
        };

        const events = await connector.normalize(raw as any, ctx);
        expect(events.length).toBe(1); // Refund event

        const refund = events[0];
        expect(refund.canonical_module).toBe("disputes");
        expect(refund.money!.amount_cents).toBe(4990);
    });
});
