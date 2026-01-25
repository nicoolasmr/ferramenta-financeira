import { createClient } from "@/lib/supabase/server";

// import { CanonicalEvent } from "@/connectors/_shared/types"; // LEGACY REMOVED

// Minimal stub to fix build if types are gone
interface CanonicalEvent {
    canonical_type: string;
    payload: any;
    timestamp: string;
}

export async function applyEvent(orgId: string, event: CanonicalEvent, provider: string) {
    const supabase = await createClient();

    if (event.canonical_type === 'order.created') {
        const payload = event.payload;

        // 1. Upsert Customer
        if (payload.customer_email) {
            const { data: customer } = await supabase.from("customers").upsert({
                org_id: orgId,
                email: payload.customer_email,
                name: payload.customer_name || payload.customer_email.split('@')[0],
                phone: payload.customer_phone
            }, { onConflict: 'org_id, email' }).select("id").single();

            if (customer && payload.external_id) {
                await supabase.from("customer_identities").upsert({
                    org_id: orgId,
                    customer_id: customer.id,
                    provider: provider,
                    external_customer_id: payload.external_id + '_cust' // Often external_id in payload is Order ID, need custom logic or trust payload has Ext Customer ID if needed.
                    // For now, minimal link.
                }, { onConflict: 'org_id, provider, external_customer_id' });
            }

            // 2. Upsert Order
            if (customer) {
                await supabase.from("orders").upsert({
                    org_id: orgId,
                    customer_id: customer.id,
                    provider: provider,
                    external_order_id: payload.external_id,
                    status: payload.status || 'pending',
                    total_amount_cents: payload.amount_cents || 0,
                    created_at: event.timestamp,
                    currency: payload.currency || 'BRL'
                }, { onConflict: 'org_id, provider, external_order_id' });

                // 3. Upsert Items
                if (payload.items && payload.items.length > 0) {
                    const { data: order } = await supabase.from("orders").select("id").eq("org_id", orgId).eq("provider", provider).eq("external_order_id", payload.external_id).single();

                    if (order) {
                        // Delete existing items to replace (simple sync)
                        await supabase.from("order_items").delete().eq("order_id", order.id);

                        const itemsToInsert = payload.items.map((item: any) => ({
                            order_id: order.id,
                            external_id: item.external_id,
                            name: item.name,
                            quantity: item.quantity,
                            unit_price_cents: item.unit_price_cents
                        }));

                        await supabase.from("order_items").insert(itemsToInsert);
                    }
                }
            }
        }
    }

    if (event.canonical_type === 'payment.confirmed') {
        const payload = event.payload;
        await supabase.from("payments").upsert({
            org_id: orgId,
            provider: provider,
            external_payment_id: payload.external_id,
            total_amount_cents: payload.amount_cents || 0,
            status: 'paid',
            paid_at: event.timestamp,
        }, { onConflict: 'org_id, provider, external_payment_id' });
    }
}
