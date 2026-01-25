
import { NormalizedEvent } from "../sdk";

export async function applySubscriptions(event: NormalizedEvent): Promise<boolean> {
    const check = event as any;
    // Basic guard: if it doesn't look like a subscription event, ignore or log
    if (!check.domain_type && !check.canonical_type.startsWith('subscriptions.')) return false;

    // We assume 'event' matches CanonicalEvent interface structure for domain_type
    const canonical = event as any as import("@/lib/contracts/canonical").CanonicalEvent;

    // Lazy load supabase
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    console.log(`[Subscriptions Engine] Applying ${canonical.canonical_type} (${canonical.domain_type})`);

    // 1. Handle Subscription State Updates
    // domain_type might be "subscription" or "invoice" mapping to subs
    // Let's assume we have a "CanonicalSubscription" interface we can cast to, 
    // or we use the payload/data map.
    // For now, using 'any' for data to be flexible with schema.

    if (canonical.canonical_type.includes('subscription.updated') ||
        canonical.canonical_type.includes('subscription.created') ||
        canonical.canonical_type.includes('subscription.canceled')) {

        const data = canonical.data as any; // Should be CanonicalSubscription

        // Map status: active, past_due, canceled, unpaid, trialing
        // We use 'provider' + 'external_id' (provider_object_id) as composite key.
        // But our table has 'org_id' unique? 
        // Wait, subscriptions table has: CONSTRAINT subscriptions_org_id_key UNIQUE (org_id)
        // This implies ONE subscription per Org.
        // If the org has multiple, we might conflict.
        // BUT for MVP logic "One Subscription per Org" is common. 
        // However, if we support multiple *providers* sending subs... 
        // We added 'idx_subscriptions_provider_unique' (provider, external_id) in migration.
        // This might conflict with unique(org_id). 
        // If an org switches provider, they might have 2 active rows? Or we overwrite?
        // Ideally we update the existing row if it's the SAME provider stuff.

        // Let's try to find by org_id first?
        // Or upsert by (org_id, provider, external_id) if we can.
        // Given the unique(org_id), we can only have ONE subscription.
        // So we should upsert by org_id.

        const { error } = await supabase.from('subscriptions').upsert({
            org_id: event.org_id,
            // provider: event.provider_key, // Added via migration
            // external_id: event.external_event_id, // Added via migration
            // For now, if migration didn't run, we might error on these cols. 
            // Optimistic assumption: columns exist.

            status: data.status || 'active',
            current_period_end: data.current_period_end, // ISO string
            // plan: data.plan_id // map to enum? 'starter' etc.
            // basic fallback:
            updated_at: new Date().toISOString()
        }, { onConflict: 'org_id' }); // Enforcing One-Sub-Per-Org rule currently.

        if (error) {
            // If error is about missing columns, we might need to be careful.
            // But assuming migration is applied or will be.
            console.error("Failed to upsert subscription", error);
            throw error;
        }
    }

    // 2. Handle Invoice Payment -> Revenue (Payments Table)
    if (canonical.canonical_type === 'subscriptions.invoice.paid') {
        const data = canonical.data as any; // CanonicalInvoice/Payment

        const { error } = await supabase.from('payments').upsert({
            org_id: event.org_id,
            project_id: event.project_id,
            provider: event.provider_key,
            provider_object_id: event.external_event_id, // Invoice ID usually
            amount_cents: data.amount_cents,
            status: 'paid',
            fee_cents: data.fee_cents || 0,
            net_cents: data.net_cents,
            metadata: { ...data, type: 'subscription_invoice' },
            updated_at: new Date().toISOString()
        }, { onConflict: 'org_id, provider, provider_object_id' });

        if (error) throw error;
    }

    return true;
}
