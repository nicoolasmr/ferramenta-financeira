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

export async function getOpportunities(orgId: string): Promise<SalesOpportunity[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("sales_opportunities")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

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
