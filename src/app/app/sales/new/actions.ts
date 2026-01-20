"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function findProducts(query: string) {
    const supabase = await createClient();
    const { data } = await supabase.from("products")
        .select("id, name, price_cents")
        .ilike("name", `%${query}%`)
        .limit(5);
    return data || [];
}

export async function findCustomers(query: string) {
    const supabase = await createClient();
    const { data } = await supabase.from("customers")
        .select("id, name, email")
        .ilike("name", `%${query}%`)
        .limit(5);
    return data || [];
}

export async function createSale(data: {
    productId: string;
    customerId: string;
    installments: number;
    amountCents: number;
}) {
    const supabase = await createClient();

    // 1. Create Enrollment (The "Wrapper" for the sale in this domain)
    const { data: enrollment, error: enrollError } = await supabase.from("enrollments").insert({
        org_id: (await supabase.auth.getUser()).data.user?.user_metadata.org_id, // Simplified. Real app needs safe org handling
        customer_id: data.customerId,
        product_id: data.productId,
        total_value_cents: data.amountCents,
        status: 'pending'
    }).select().single();

    if (enrollError) return { error: enrollError.message };

    // 2. Create Installments
    const installmentValue = Math.floor(data.amountCents / data.installments);
    const installmentsToAdd = Array.from({ length: data.installments }).map((_, i) => ({
        org_id: enrollment.org_id,
        enrollment_id: enrollment.id,
        installment_number: i + 1,
        amount_cents: installmentValue,
        due_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days each
        status: 'pending'
    }));

    const { error: instError } = await supabase.from("installments").insert(installmentsToAdd);

    if (instError) return { error: instError.message };

    revalidatePath("/app/sales");
    return { success: true, enrollmentId: enrollment.id };
}
