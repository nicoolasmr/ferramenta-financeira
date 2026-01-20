"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPortfolioFinancials(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("portfolio_financials_view")
        .select("*")
        .eq("org_id", orgId)
        .single();

    if (error) {
        console.error("Error fetching financials:", error);
        return null;
    }

    return data;
}

export async function getTopProjects(orgId: string) {
    const supabase = await createClient();
    // Assuming we have a view or can query installments aggregated
    // For MVP, just list projects with total volume
    // Ideally create a specific view for this leaderboard.
    const { data } = await supabase.from('projects')
        .select(`id, name, enrollments(count)`)
        .eq('org_id', orgId)
        .limit(5);

    return data;
}
