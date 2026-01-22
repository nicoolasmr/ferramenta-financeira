"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ImportResult {
    success: number;
    failed: number;
    skipped: number;
    errors: { row: number; message: string }[];
}

export async function importCustomers(
    orgId: string,
    customers: Record<string, any>[]
): Promise<ImportResult> {
    const supabase = await createClient();
    const result: ImportResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };

    // Check for existing customers by email to avoid duplicates
    const emails = customers.map(c => c.email).filter(Boolean);
    const { data: existing } = await supabase
        .from('customers')
        .select('email')
        .eq('org_id', orgId)
        .in('email', emails);

    const existingEmails = new Set(existing?.map(c => c.email) || []);

    // Batch insert for performance
    const BATCH_SIZE = 100;
    const toInsert = customers.filter(c => {
        if (c.email && existingEmails.has(c.email)) {
            result.skipped++;
            return false;
        }
        return true;
    });

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE).map(customer => ({
            org_id: orgId,
            name: customer.name,
            email: customer.email || null,
            phone: customer.phone || null,
            document: customer.document || null,
            source: 'csv_import',
            tags: customer.tags ? (typeof customer.tags === 'string' ? JSON.parse(customer.tags) : customer.tags) : []
        }));

        const { data, error } = await supabase
            .from('customers')
            .insert(batch)
            .select();

        if (error) {
            result.failed += batch.length;
            result.errors.push({
                row: i,
                message: error.message
            });
            console.error('Import error:', error);
        } else {
            result.success += data.length;
        }
    }

    revalidatePath('/app/customers');
    return result;
}

export async function getImportTemplate(): Promise<string> {
    const headers = ['name', 'email', 'phone', 'document'];
    const example = ['John Doe', 'john@example.com', '+55 11 99999-9999', '12345678900'];

    return `${headers.join(',')}\n${example.join(',')}`;
}
