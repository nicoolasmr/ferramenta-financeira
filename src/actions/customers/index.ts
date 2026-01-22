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

export async function getCustomers(orgId: string): Promise<Customer[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

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
