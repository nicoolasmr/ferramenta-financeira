"use server";

import { createClient } from "@/lib/supabase/server";

export interface ExportOptions {
    columns: string[];
    format?: 'csv' | 'json' | 'pdf';
    filters?: {
        search?: string;
        dateFrom?: string;
        dateTo?: string;
    };
}

export async function exportCustomers(
    orgId: string,
    options: ExportOptions
): Promise<Record<string, any>[]> {
    const supabase = await createClient();

    let query = supabase
        .from('customers')
        .select(options.columns.join(','))
        .eq('org_id', orgId);

    // Apply filters if provided
    if (options.filters?.search) {
        query = query.or(`name.ilike.%${options.filters.search}%,email.ilike.%${options.filters.search}%`);
    }

    if (options.filters?.dateFrom) {
        query = query.gte('created_at', options.filters.dateFrom);
    }

    if (options.filters?.dateTo) {
        query = query.lte('created_at', options.filters.dateTo);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Export error:', error);
        throw error;
    }

    return data || [];
}
