"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Customer {
    id: string;
    org_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    tags: string[];
    source: string;
    created_at: string;
}

export interface CustomerFilters {
    search?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    tags?: string[];
    source?: string[];
}

export async function getCustomers(orgId: string, filters?: CustomerFilters): Promise<Customer[]> {
    const supabase = await createClient();

    let query = supabase
        .from("customers")
        .select("*")
        .eq("org_id", orgId);

    // Apply search filter
    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,document.ilike.%${filters.search}%`);
    }

    // Apply date range filter
    if (filters?.dateRange) {
        query = query
            .gte("created_at", filters.dateRange.from.toISOString())
            .lte("created_at", filters.dateRange.to.toISOString());
    }

    // Apply tags filter
    if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
    }

    // Apply source filter
    if (filters?.source && filters.source.length > 0) {
        query = query.in("source", filters.source);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching customers:", error);
        throw new Error("Failed to fetch customers");
    }

    return data || [];
}

export async function createCustomer(formData: {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
    org_id: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("customers")
        .insert({
            name: formData.name,
            email: formData.email || null,
            phone: formData.phone || null,
            document: formData.document || null,
            org_id: formData.org_id,
            tags: [],
            source: "manual",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating customer:", error);
        throw new Error("Failed to create customer");
    }

    revalidatePath("/app/customers");
    return data;
}

export async function updateCustomer(id: string, formData: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("customers")
        .update(formData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating customer:", error);
        throw new Error("Failed to update customer");
    }

    revalidatePath("/app/customers");
    return data;
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting customer:", error);
        throw new Error("Failed to delete customer");
    }

    revalidatePath("/app/customers");
}
