import { createClient } from "@/lib/supabase/server";
import { CanonicalEvent } from "./normalizer";

export async function applyEvent(orgId: string, event: CanonicalEvent, provider: string) {
    const supabase = await createClient();

    if (event.canonicalType === 'order.created') {
        // 1. Upsert Customer
        if (event.payload.customerEmail) {
            const { data: customer } = await supabase.from("customers").upsert({
                org_id: orgId,
                email: event.payload.customerEmail,
                name: event.payload.customerName || event.payload.customerEmail.split('@')[0],
            }, { onConflict: 'org_id, email' }).select("id").single();

            if (customer && event.payload.externalCustomerId) {
                // Link Identity
                await supabase.from("customer_identities").upsert({
                    org_id: orgId,
                    customer_id: customer.id,
                    provider: provider,
                    external_customer_id: event.payload.externalCustomerId
                }, { onConflict: 'org_id, provider, external_customer_id' });
            }

            // 2. Upsert Order
            if (customer) {
                await supabase.from("orders").upsert({
                    org_id: orgId,
                    customer_id: customer.id,
                    provider: provider,
                    external_order_id: event.externalId,
                    status: event.payload.status || 'pending',
                    total_amount_cents: event.payload.amountCents || 0,
                    created_at: event.occurredAt
                }, { onConflict: 'org_id, provider, external_order_id' });
            }
        }
    }
}
