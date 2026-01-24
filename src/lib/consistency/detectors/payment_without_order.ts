
import { AnomalyDetector, logAnomaly } from "../types";

export const PaymentWithoutOrderDetector: AnomalyDetector = {
    name: "payment_without_order",
    async run(supabase) {
        // Condition: Payment exists but order_id is null OR order_id references non-existent order
        // In our schema, payment.order_id is nullable (sometimes just a direct charge).
        // But if we want strict consistency, every payment should belong to an order context?
        // Let's flag payments that are "orphaned" (no order link) 
        // AND maybe check if external_refs provided a related_id we missed.

        const { data: orphans, error } = await supabase
            .from('payments')
            .select('id, org_id, project_id, provider, amount_cents, provider_object_id')
            .is('order_id', null)
            .eq('status', 'paid')
            .limit(100);

        if (error) {
            console.error("Detector failed:", error);
            return;
        }

        for (const payment of orphans) {
            await logAnomaly(supabase, {
                org_id: payment.org_id,
                project_id: payment.project_id,
                severity: 'medium',
                anomaly_type: 'payment_without_order',
                entity_type: 'payment',
                entity_id: payment.id,
                description: `Payment ${payment.amount_cents} (cents) from ${payment.provider} has no linked Order.`,
                details: { provider_id: payment.provider_object_id }
            });
        }
    }
};
