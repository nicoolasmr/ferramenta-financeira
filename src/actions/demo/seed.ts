
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function seedDemoData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // 1. Get or Create Org
    const { data: member } = await supabase.from('organization_members').select('org_id').eq('user_id', user.id).single();
    if (!member) throw new Error("No org found");
    const orgId = member.org_id;

    // 2. Create Project "Demo Project"
    const { data: project, error } = await supabase.from('projects')
        .insert({
            org_id: orgId,
            name: "Demo Project (RevenueOS)",
            settings: { demo: true }
        })
        .select()
        .single();

    if (error) throw error;
    const projectId = project.id;

    // 3. Seed Mock Transactions (Sales)
    const now = new Date();
    const mockPayments = [];

    // Past 30 days
    for (let i = 0; i < 50; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        mockPayments.push({
            org_id: orgId,
            project_id: projectId,
            provider: 'stripe',
            provider_object_id: `demo_ch_${i}`,
            amount_cents: [9900, 19900, 49900][Math.floor(Math.random() * 3)],
            status: 'paid',
            created_at: date.toISOString(),
            updated_at: date.toISOString()
        });
    }

    // 4. Seed Mock Overdue (The "Money Found")
    // Creating "pending" orders that are old -> logic for overdue
    // Or explicit overdue payments (if model supports, usually invoices)

    // Insert Payments
    await supabase.from('payments').insert(mockPayments);

    // Insert Orders (Overdue)
    // Assuming 'orders' table
    const mockOrders = [];
    for (let i = 0; i < 15; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - Math.floor(Math.random() * 60) - 10); // 10 to 70 days ago

        mockOrders.push({
            org_id: orgId,
            project_id: projectId,
            provider: 'hotmart',
            provider_object_id: `demo_ord_${i}`,
            status: 'pending', // or 'past_due'
            gross_amount_cents: 29700,
            currency: 'BRL',
            data: { customer_email: `lead_${i}@example.com` },
            created_at: date.toISOString(),
            updated_at: date.toISOString()
        });
    }
    await supabase.from('orders').insert(mockOrders);

    return { success: true, projectId };
}
