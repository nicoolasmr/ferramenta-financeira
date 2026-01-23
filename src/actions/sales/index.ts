"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SalesOpportunity {
    id: string;
    name: string;
    customer_id: string;
    value: number;
    stage: string;
    probability: number;
    expected_close_date: string;
    org_id: string;
    created_at: string;
    updated_at: string;
}

export interface SalesFilters {
    search?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    stage?: string[];
    valueRange?: {
        min?: number;
        max?: number;
    };
}

export async function getOpportunities(orgId: string, filters?: SalesFilters): Promise<SalesOpportunity[]> {
    const supabase = await createClient();

    let query = supabase
        .from("sales_opportunities")
        .select("*")
        .eq("org_id", orgId);

    // Apply search filter (name)
    if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
    }

    // Apply date range filter (created_at)
    if (filters?.dateRange) {
        query = query
            .gte("created_at", filters.dateRange.from.toISOString())
            .lte("created_at", filters.dateRange.to.toISOString());
    }

    // Apply stage filter
    if (filters?.stage && filters.stage.length > 0) {
        query = query.in("stage", filters.stage);
    }

    // Apply value range filter
    if (filters?.valueRange) {
        if (filters.valueRange.min !== undefined) {
            query = query.gte("value", filters.valueRange.min);
        }
        if (filters.valueRange.max !== undefined) {
            query = query.lte("value", filters.valueRange.max);
        }
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
}

export async function createOpportunity(formData: {
    name: string;
    customer_id: string;
    value: number;
    stage: string;
    probability: number;
    expected_close_date: string;
    org_id: string;
}) {
    const supabase = await createClient();
    const { error } = await supabase.from("sales_opportunities").insert(formData);

    if (error) throw error;
    revalidatePath("/app/sales");
}

export async function updateOpportunity(id: string, formData: Partial<SalesOpportunity>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("sales_opportunities")
        .update(formData)
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/app/sales");
}

export async function deleteOpportunity(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("sales_opportunities").delete().eq("id", id);

    if (error) throw error;
    revalidatePath("/app/sales");
}

export async function moveOpportunityStage(id: string, newStage: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("sales_opportunities")
        .update({ stage: newStage })
        .eq("id", id);

    if (error) throw error;
    revalidatePath("/app/sales");
}
