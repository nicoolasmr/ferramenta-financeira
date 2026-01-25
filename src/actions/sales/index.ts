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

    if (error) {
        console.error("Error creating opportunity:", error);
        throw error;
    }
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

export async function createManualSale(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Não autorizado" };
    }

    const orgId = formData.get("orgId") as string;
    const projectId = formData.get("projectId") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const amountStr = formData.get("amount") as string;
    const installmentsStr = formData.get("installments") as string;
    const method = formData.get("method") as string;

    const amountCents = Math.round(parseFloat(amountStr.replace("R$", "").replace(/\./g, "").replace(",", ".")) * 100);
    const installments = parseInt(installmentsStr) || 1;

    // 1. Find or Create Customer
    let customerId;
    const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("org_id", orgId)
        .eq("email", customerEmail)
        .single();

    if (existingCustomer) {
        customerId = existingCustomer.id;
    } else {
        const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
                org_id: orgId,
                name: customerName,
                email: customerEmail,
                source: "manual"
            })
            .select("id")
            .single();

        if (customerError) return { error: `Erro ao criar cliente: ${customerError.message}` };
        customerId = newCustomer.id;
    }

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            org_id: orgId,
            project_id: projectId, // This is key for the AI requirement!
            customer_id: customerId,
            status: "paid", // Manual sales are usually reported as "done"
            source: "manual",
            gross_amount_cents: amountCents,
            net_amount_cents: amountCents, // Simplified
            purchase_datetime: new Date().toISOString()
        })
        .select("id")
        .single();

    if (orderError) return { error: `Erro ao criar pedido: ${orderError.message}` };

    // 3. Create Payment (Triggers Receivables Explosion)
    const { error: paymentError } = await supabase
        .from("payments")
        .insert({
            org_id: orgId,
            order_id: order.id,
            method: method,
            gateway: "manual",
            status: "paid", // First installment or overall status
            installments: installments,
            amount_cents: amountCents,
            paid_at: new Date().toISOString()
        });

    if (paymentError) return { error: `Erro ao criar pagamento: ${paymentError.message}` };

    revalidatePath("/app/sales");
    revalidatePath("/app/dashboard");
    return { success: true };
}
