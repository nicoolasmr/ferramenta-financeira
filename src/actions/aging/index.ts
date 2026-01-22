"use server";

import { createClient } from "@/lib/supabase/server";

export interface AgingBucket {
    range: string;
    count: number;
    total_value: number;
}

export async function getAgingReport(orgId: string): Promise<AgingBucket[]> {
    const supabase = await createClient();

    // Get all receivables
    const { data: receivables, error } = await supabase
        .from("receivables")
        .select("*")
        .eq("org_id", orgId);

    if (error) throw error;

    // Calculate aging buckets
    const now = new Date();
    const buckets: Record<string, AgingBucket> = {
        "0-30": { range: "0-30 days", count: 0, total_value: 0 },
        "31-60": { range: "31-60 days", count: 0, total_value: 0 },
        "61-90": { range: "61-90 days", count: 0, total_value: 0 },
        "90+": { range: "90+ days", count: 0, total_value: 0 },
    };

    receivables?.forEach((receivable) => {
        const dueDate = new Date(receivable.due_date);
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        let bucket: string;
        if (daysOverdue <= 30) bucket = "0-30";
        else if (daysOverdue <= 60) bucket = "31-60";
        else if (daysOverdue <= 90) bucket = "61-90";
        else bucket = "90+";

        buckets[bucket].count++;
        buckets[bucket].total_value += receivable.amount;
    });

    return Object.values(buckets);
}

export async function exportAgingReport(orgId: string): Promise<string> {
    const buckets = await getAgingReport(orgId);

    // Generate CSV
    const headers = ["Range", "Count", "Total Value"];
    const rows = buckets.map((bucket) => [
        bucket.range,
        bucket.count.toString(),
        `R$ ${bucket.total_value.toFixed(2)}`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
}
