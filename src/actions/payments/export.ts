"use server";

import { createClient } from "@/lib/supabase/server";

export async function exportPayments(
    orgId: string,
    selectedColumns: string[],
    format: 'csv' | 'json' | 'pdf'
): Promise<Record<string, any>[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .select(`
            id,
            amount,
            status,
            payment_method,
            provider,
            created_at,
            due_date,
            paid_at,
            customer:customers(name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Export payments error:', error);
        throw new Error('Failed to fetch payments data');
    }

    if (!data) return [];

    // Flatten
    return data.map(row => {
        const flat: any = { ...row };
        if (row.customer) {
            // @ts-ignore
            flat['customer_name'] = row.customer.name;
        }
        return flat;
    });
}
