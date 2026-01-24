
import { NormalizedEvent } from "../sdk";
import { createClient } from "@/lib/supabase/server";

export async function applySales(event: NormalizedEvent): Promise<boolean> {
    const supabase = await createClient();
    const { payload, canonical_type, money, external_refs } = event;

    console.log(`[Sales Engine] Applying ${canonical_type} for ${event.provider_key}`);

    // Logic: Upsert Order/Payment based on type
    // This is where "Deterministic-first" logic lives (Views/Rules)
    // For now, we replicate the logic we had in 'applyToDomain' but split by module

    if (canonical_type === 'sales.order.created' || canonical_type === 'sales.order.paid') {
        const { error } = await supabase.from('orders').upsert({
            org_id: event.org_id,
            project_id: event.project_id,
            provider: event.provider_key,
            provider_object_id: event.external_event_id, // Or use specific ref?
            status: canonical_type === 'sales.order.paid' ? 'paid' : 'created',
            gross_amount_cents: money?.amount_cents || 0,
            currency: money?.currency || 'BRL',
            data: payload, // Store standardized payload
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    }

    if (canonical_type === 'sales.payment.succeeded') {
        // Upsert Payment
        const { error } = await supabase.from('payments').upsert({
            org_id: event.org_id,
            project_id: event.project_id,
            provider: event.provider_key,
            provider_object_id: event.external_event_id,
            amount_cents: money?.amount_cents,
            status: 'paid',
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    }

    return true;
}
