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

    // New CRM Metadata
    const niche = formData.get("niche") as string;
    const status = formData.get("status") as string;
    const cycleStart = formData.get("cycleStart") as string;
    const cycleEnd = formData.get("cycleEnd") as string;
    const cycleDuration = formData.get("cycleDuration") as string;
    const situation = formData.get("situation") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    const initialDiagnosis = formData.get("initialDiagnosis") as string;
    const meeting1 = formData.get("meeting1") as string;
    const contractSigned = formData.get("contractSigned") as string;
    const followup = formData.get("followup") as string;
    const mentoredFolder = formData.get("mentoredFolder") as string;
    const paymentDetails = formData.get("paymentDetails") as string;

    const amountCents = Math.round(parseFloat(amountStr.replace("R$", "").replace(/\./g, "").replace(",", ".")) * 100);
    const installments = parseInt(installmentsStr) || 1;

    // 1. Find or Create Customer
    let customerId;
    const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id, metadata")
        .eq("org_id", orgId)
        .eq("email", customerEmail)
        .maybeSingle();

    const customerMetadata = {
        niche,
        status,
        cycle_start: cycleStart,
        cycle_end: cycleEnd,
        cycle_duration: cycleDuration,
        situation,
        address
    };

    if (existingCustomer) {
        customerId = existingCustomer.id;
        // Update customer metadata (MERGE with existing)
        const currentMeta = existingCustomer.metadata || {};
        const mergedMeta = { ...currentMeta, ...customerMetadata };

        await supabase
            .from("customers")
            .update({
                phone: phone || undefined,
                metadata: mergedMeta
            })
            .eq("id", customerId);
    } else {
        const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
                org_id: orgId,
                name: customerName,
                email: customerEmail,
                phone: phone || null,
                source: "manual",
                metadata: customerMetadata
            })
            .select("id")
            .single();

        if (customerError) {
            console.error("[createManualSale] Customer creation error:", customerError);
            return { error: `Erro ao criar cliente: ${customerError.message}` };
        }
        customerId = newCustomer.id;
    }

    // 2. Create Order
    const orderMetadata = {
        initial_diagnosis: initialDiagnosis,
        meeting_1: meeting1,
        contract_signed: contractSigned,
        followup: followup,
        mentored_folder: mentoredFolder,
        payment_details: paymentDetails
    };

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            org_id: orgId,
            project_id: projectId,
            customer_id: customerId,
            status: "paid",
            source: "manual",
            gross_amount_cents: amountCents,
            net_amount_cents: amountCents,
            purchase_datetime: new Date().toISOString(),
            metadata: orderMetadata
        })
        .select("id")
        .single();

    if (orderError) {
        console.error("[createManualSale] Order creation error:", orderError);
        return { error: `Erro ao criar pedido: ${orderError.message}` };
    }

    // 3. Create Payment
    const { error: paymentError } = await supabase
        .from("payments")
        .insert({
            org_id: orgId,
            order_id: order.id,
            method: method,
            gateway: "manual",
            status: "paid",
            installments: installments,
            amount_cents: amountCents,
            paid_at: new Date().toISOString()
        });

    if (paymentError) {
        console.error("[createManualSale] Payment creation error:", paymentError);
        return { error: `Erro ao criar pagamento: ${paymentError.message}` };
    }

    revalidatePath("/app/sales");
    revalidatePath("/app/dashboard");
    revalidatePath("/app/customers");
    return { success: true };
}
