"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProjectReceivablesForecast(orgId: string, projectId: string, months = 12) {
    const supabase = await createClient();

    // Calculate cutoff date
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + months);

    // Query Receivables Table (The "Nuclear" Source of Truth)
    const { data, error } = await supabase
        .from("receivables")
        .select("amount_cents, due_date, status")
        .eq("org_id", orgId)
        .eq("project_id", projectId)
        .gte("due_date", today.toISOString())
        .lte("due_date", futureDate.toISOString());

    if (error) {
        console.error("Forecast Error:", error);
        return { total: 0, count: 0 };
    }

    const totalCents = data.reduce((acc, curr) => acc + curr.amount_cents, 0);

    return {
        total: totalCents / 100,
        count: data.length,
        period: `${months} months`
    };
}
