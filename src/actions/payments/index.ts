"use server";

import { createClient } from "@/lib/supabase/server";

export interface Payment {
    id: string;
    customer_id: string;
    amount: number;
    status: "paid" | "pending" | "failed";
    method: string;
    created_at: string;
    org_id: string;
}

export async function getPayments(orgId: string): Promise<Payment[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getPaymentsSummary(orgId: string) {
    const payments = await getPayments(orgId);

    const summary = {
        total_received: payments
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0),
        total_pending: payments
            .filter((p) => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0),
        total_failed: payments
            .filter((p) => p.status === "failed")
            .reduce((sum, p) => sum + p.amount, 0),
    };

    return summary;
}

export async function exportPayments(orgId: string): Promise<string> {
    const payments = await getPayments(orgId);

    // Generate CSV
    const headers = ["ID", "Customer ID", "Amount", "Status", "Method", "Date"];
    const rows = payments.map((payment) => [
        payment.id,
        payment.customer_id,
        `R$ ${payment.amount.toFixed(2)}`,
        payment.status,
        payment.method,
        new Date(payment.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
}
