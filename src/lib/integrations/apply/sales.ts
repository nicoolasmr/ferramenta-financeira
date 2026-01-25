
import { NormalizedEvent } from "../sdk";
import { createClient } from "@/lib/supabase/server";

export async function applySales(event: NormalizedEvent): Promise<boolean> {
    const supabase = await createClient();
    const { payload, canonical_type, money, external_refs } = event;

    console.log(`[Sales Engine] Applying ${canonical_type} for ${event.provider_key}`);

    // IDEMPOTENCY:
    // The tables (orders, payments) have UNIQUE constraints on (org_id, provider, provider_object_id).
    // So 'upsert' handles it gracefully.

    if (canonical_type === 'sales.order.created' || canonical_type === 'sales.order.paid' || (canonical_type as string) === 'sales.order.refunded') {
        // Use 'data' field which now exists on NormalizedEvent (added in sdk.ts)
        const orderData = event.data as import("@/lib/contracts/canonical").CanonicalOrder;

        if (orderData) {
            const { error } = await supabase.from('orders').upsert({
                org_id: event.org_id,
                project_id: event.project_id,
                provider: event.provider_key,
                provider_object_id: event.external_event_id,
                status: orderData.status,
                gross_amount_cents: orderData.total_cents,
                currency: orderData.currency,
                customer_email: orderData.customer.email,
                metadata: orderData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'org_id, provider, provider_object_id' });

            if (error) {
                console.error("Failed to upsert order", error);
                throw error;
            }
        }
    }

    if (canonical_type === 'sales.payment.succeeded' || canonical_type === 'sales.payment.failed') {
        const paymentData = event.data as import("@/lib/contracts/canonical").CanonicalPayment;

        if (paymentData) {
            const { error } = await supabase.from('payments').upsert({
                org_id: event.org_id,
                project_id: event.project_id,
                provider: event.provider_key,
                provider_object_id: event.external_event_id,
                amount_cents: paymentData.amount_cents,
                status: paymentData.status,
                net_cents: paymentData.net_cents,
                fee_cents: paymentData.fee_cents,
                metadata: paymentData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'org_id, provider, provider_object_id' });

            if (error) throw error;
        }
    }

    return true;
}
