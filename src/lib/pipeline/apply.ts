
import { createClient } from "@/lib/supabase/server";
import { CanonicalEvent, CanonicalOrder, CanonicalPayment, OrderStatus } from "@/lib/contracts/canonical";

/**
 * Apply to Domain
 * Takes a Canonical Event and updates the System of Record (Domain Tables).
 */
export async function applyToDomain(events: CanonicalEvent[]) {
    const supabase = await createClient();

    for (const event of events) {
        try {
            switch (event.domain_type) {
                case "order":
                    await applyOrder(supabase, event);
                    break;
                case "payment":
                    await applyPayment(supabase, event);
                    break;
                // Add other handlers
                default:
                    console.log(`No domain handler for type: ${event.domain_type}`);
            }
        } catch (error) {
            console.error(`Failed to apply event ${event.domain_type}:`, error);
            // Log anomaly
            await supabase.from('state_anomalies').insert({
                org_id: event.org_id,
                entity_type: event.domain_type,
                entity_id: event.refs.provider_object_id,
                description: `Apply failed: ${error}`,
                severity: 'error'
            });
        }
    }
}

async function applyOrder(supabase: any, event: CanonicalEvent) {
    const data = event.data as CanonicalOrder;

    const { data: record, error } = await supabase.from("orders").upsert({
        org_id: event.org_id,
        project_id: event.project_id,
        provider: event.provider,
        provider_object_id: event.refs.provider_object_id,
        customer: data.customer, // Store JSONB or specific cols
        products: data.products,
        gross_amount_cents: data.total_cents, // Correct column name
        currency: data.currency,
        status: data.status,
        created_at: event.occurred_at,
        updated_at: new Date().toISOString()
    }, { onConflict: "org_id, provider, provider_object_id" })
        .select()
        .single();

    if (error) throw error;
    if (!record) return;

    // 2. Identity Spine
    await upsertExternalRef(supabase, event, 'order', record.id);

    // 3. Ledger (Sale)
    // OrderStatus.CONFIRMED usually means paid/verified.
    if (data.status === OrderStatus.CONFIRMED) {
        await createLedgerEntry(supabase, {
            org_id: event.org_id,
            project_id: event.project_id,
            entry_date: new Date(event.occurred_at).toISOString().split('T')[0],
            direction: 'credit',
            amount_cents: data.total_cents,
            category: 'sale',
            source_type: 'order',
            source_id: record.id,
            source_provider: event.provider,
            source_external_id: event.refs.provider_object_id,
            order_id: record.id,
            memo: `Sale from ${event.provider}`
        });
    }
}

async function applyPayment(supabase: any, event: CanonicalEvent) {
    const data = event.data as CanonicalPayment;

    const { data: record, error } = await supabase.from("payments").upsert({
        org_id: event.org_id,
        project_id: event.project_id,
        provider: event.provider,
        provider_object_id: event.refs.provider_object_id,
        order_id: data.order_id, // Need to resolve internal ID if possible in a real scenario
        amount_cents: data.amount_cents,
        net_cents: data.net_cents,
        fee_cents: data.fee_cents,
        status: data.status,
        method: data.method,
        installments: data.installments,
        created_at: event.occurred_at,
        updated_at: new Date().toISOString()
    }, { onConflict: "org_id, provider, provider_object_id" })
        .select()
        .single();

    if (error) throw error;
    if (!record) return;

    // 2. Identity Spine
    await upsertExternalRef(supabase, event, 'payment', record.id);

    // 3. Ledger
    // Credit is usually recognized at Sale (Accrual) or Payment (Cash)?
    // For pure Cash flow view, Payment is key.
    // If we double count Sale and Payment, we need to balance them.
    // Simplifying for RevenueOS:
    // - Sale = Revenue Recognized (Credit)
    // - Payment = Cash Movement (Bank Debit / Gateway Credit)
    // - Fee = Expense (Debit)

    // Let's just log the FEE as a Debit here. 
    // The Revenue Credit is on the Order. 
    // (Or if Cash Basis, on the Payment).
    // Let's assume Accrual Basis for 'sale'.

    if (data.status === 'paid') {
        // Log Fee
        if (data.fee_cents > 0) {
            await createLedgerEntry(supabase, {
                org_id: event.org_id,
                project_id: event.project_id,
                entry_date: new Date(event.occurred_at).toISOString().split('T')[0],
                direction: 'debit',
                amount_cents: data.fee_cents,
                category: 'payment_fee',
                source_type: 'payment',
                source_id: record.id,
                source_provider: event.provider,
                source_external_id: event.refs.provider_object_id,
                payment_id: record.id,
                memo: `Fee for ${event.provider} payment`
            });
        }
    }
}

// --- Helpers ---

async function upsertExternalRef(supabase: any, event: CanonicalEvent, entityType: string, internalId: string) {
    await supabase.from('external_refs').upsert({
        org_id: event.org_id,
        project_id: event.project_id,
        provider: event.provider,
        entity_type: entityType,
        provider_object_id: event.refs.provider_object_id,
        canonical_table: entityType + 's', // naive pluralization
        canonical_id: internalId,
        created_at: new Date().toISOString()
    }, { onConflict: 'org_id, provider, entity_type, provider_object_id' });
}

async function createLedgerEntry(supabase: any, entry: any) {
    // Rely on idempotency_key generated by MD5 or unique index if we had one based on content.
    // The migration v2.2 removed the generated column to fix 42P17.
    // So we MUST generate md5 here or let the DB insert succeed/fail if we have a UNIQUE constraint on business keys?
    // We didn't add a UNIQUE constraint on all business keys in SQL, just a generic index.
    // Ideally we generate a robust key here.

    const crypto = await import('crypto'); // Dynamic import or require if node
    const rawKey = `${entry.org_id}|${entry.source_type}|${entry.source_id}|${entry.category}|${entry.amount_cents}|${entry.entry_date}`;
    const idempotencyKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    await supabase.from('ledger_entries').upsert({
        ...entry,
        idempotency_key: idempotencyKey
    }, { onConflict: 'idempotency_key' }); // We assume we have a unique index on this key now
}
