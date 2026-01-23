"use server";

import { createClient } from "@/lib/supabase/server";

export interface ExportOptions {
    columns: string[];
    // Can expand with filters later if needed
}

export async function exportSales(
    orgId: string,
    selectedColumns: string[],
    format: 'csv' | 'json' | 'pdf'
): Promise<Record<string, any>[]> {
    const supabase = await createClient();

    // Mapping columns to DB fields if names differ
    // For now assuming direct mapping or join syntax
    // e.g. 'customer.name' handles joins automatically in PostgREST if views setup? 
    // Actually standard tables need explicit select.

    // Simplification: We select * for now then filter in JS to ensure we get relations?
    // Or construct the select string.

    let selectString = selectedColumns.map(col => {
        // Handle nested fields like customer.name -> customer(name)
        if (col.includes('.')) {
            const [table, field] = col.split('.');
            return `${table}(${field})`;
        }
        return col;
    }).join(',');

    // If no columns selected (shouldn't happen due to UI validation), fallback
    if (!selectString) selectString = '*';

    // Ensure we always get basic info if not selected? No, trust selection.

    const { data, error } = await supabase
        .from('orders') // Assuming sales = orders table
        .select(`
            id,
            status,
            amount,
            created_at,
            customer:customers(name, email),
            items:order_items(count)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Export sales error:', error);
        throw new Error('Failed to fetch sales data');
    }

    if (!data) return [];

    // Flatten data for export
    return data.map(row => {
        const flat: any = { ...row };

        // Flatten relationship fields manually for the table generator
        if (row.customer) {
            // @ts-ignore
            flat['customer_name'] = row.customer.name;
            // @ts-ignore
            flat['customer_email'] = row.customer.email;
        }

        return flat;
    });
}
