

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; // Assume installed or I will install it.
// Load .env.local if exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config();
}

import { createServiceClient } from "@/lib/supabase/service";
import { processPendingJobs } from "@/lib/queue/worker";
import { enqueueJob } from "@/lib/queue/enqueue";

async function verifyFlow() {
    const supabase = createServiceClient();
    console.log("🚀 Starting Verification Flow (C5)...");

    const ORG_ID = "00000000-0000-0000-0000-000000000000"; // Sentinel for tests if needed, or fetch one.
    // Ideally we fetch a real org or create one.
    let { data: org } = await supabase.from('organizations').select('id').limit(1).maybeSingle();

    if (!org) {
        console.log("⚠️ No Organization found. Creating one...");
        const { data: newOrg, error: createError } = await supabase.from('organizations').insert({
            name: "Verification Org",
            slug: `verify-org-${Date.now()}`,
            // Add other required fields if any (check schema)
        }).select('id').single();

        if (createError) {
            console.error("❌ Failed to create Org:", createError);
            return;
        }
        org = newOrg;
    }
    const orgId = org!.id;
    console.log(`Using Org ID: ${orgId}`);

    // 1. CLEAR STATE (Optional, for clean test)
    // await supabase.from('external_events_raw').delete().eq('org_id', orgId);

    // 2. INSERT RAW EVENT (Simulating Webhook)
    const mockPayload = {
        order_id: `test_order_${Date.now()}`,
        order_status: "paid",
        commission_total_value: 150.00,
        Customer: {
            full_name: "Test User C5",
            email: "test.c5@example.com",
            mobile: "+5511999999999"
        },
        payment_method_type: "pix"
    };

    console.log("1️⃣ Inserting Raw Event...");
    const { data: rawEvent, error: rawError } = await supabase.from('external_events_raw').insert({
        org_id: orgId,
        provider: 'kiwify',
        event_type: 'order_approved',
        payload: mockPayload,
        idempotency_key: `test_idem_${Date.now()}`,
        status: 'pending'
    }).select().single();

    if (rawError) {
        console.error("❌ Failed to insert raw event:", rawError);
        return;
    }
    console.log(`✅ Raw Event Created: ${rawEvent.id}`);

    // 3. ENQUEUE JOB (Simulating Route Handler)
    console.log("2️⃣ Enqueuing Normalize Job...");
    await enqueueJob(orgId, 'normalize_event', { raw_event_id: rawEvent.id });

    // 4. RUN WORKER (Normalize)
    console.log("3️⃣ Running Worker (Pass 1 - Normalize)...");
    const result1 = await processPendingJobs();
    console.log(`   Processed: ${result1.processed}`);

    // 5. RUN WORKER (Apply) - The Normalize step enqueues 'apply_event' jobs.
    console.log("4️⃣ Running Worker (Pass 2 - Apply)...");
    // We loop a few times to ensure we catch the generic queued jobs
    const result2 = await processPendingJobs();
    console.log(`   Processed: ${result2.processed}`);

    // 6. VERIFY LEDGER
    console.log("5️⃣ Verifying Ledger...");

    // Check Order
    const { data: order } = await supabase.from('orders')
        .select('*')
        .eq('provider_object_id', mockPayload.order_id)
        .single();

    if (order) {
        console.log("✅ Order Found In Ledger!");
        console.log(`   ID: ${order.id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Amount: ${order.gross_amount_cents}`);
    } else {
        console.error("❌ Order NOT found in Ledger.");
    }

    // Check Payment
    const { data: payment } = await supabase.from('payments')
        .select('*')
        .eq('provider_object_id', mockPayload.order_id) // Kiwify uses order_id as ref often, or payment id if verified
        .single();

    if (payment) {
        console.log("✅ Payment Found In Ledger!");
        console.log(`   ID: ${payment.id}`);
        console.log(`   Amount: ${payment.amount_cents}`);
    } else {
        console.log("ℹ️ Payment check: (Might depend on exact mapping in normalize.ts)");
    }

    console.log("🏁 Verification Complete.");
}

verifyFlow().catch(console.error);
