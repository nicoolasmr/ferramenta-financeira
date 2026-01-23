"use server";

import { createClient } from "@/lib/supabase/server";

export interface CopilotSuggestion {
    id: string;
    org_id: string;
    project_id?: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low" | "critical";
    category: string;
    suggestion_type: string;
    action_url?: string;
    status: "active" | "dismissed" | "completed";
    created_at: string;
}

export async function getCopilotSuggestions(orgId: string): Promise<CopilotSuggestion[]> {
    const supabase = await createClient();

    // Auto-run a check before returning (background-ish)
    // In a massive app this would be a CRON, but for now we do it on load
    runAnomalyCheck(orgId).catch(console.error);

    const { data, error } = await supabase
        .from("copilot_suggestions")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "active")
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) throw error;
    return data || [];
}

export async function runAnomalyCheck(orgId: string) {
    const supabase = await createClient();

    // 1. Check for Revenue Drops
    const { data: anomalies } = await supabase
        .from("revenue_anomaly_view")
        .select("*")
        .eq("org_id", orgId)
        .order("week", { ascending: false })
        .limit(1);

    if (anomalies && anomalies.length > 0) {
        const latest = anomalies[0];
        if (latest.wow_change_pct < -20) {
            // Check if we already have a recent alert for this
            const { count } = await supabase
                .from("copilot_suggestions")
                .select("*", { count: 'exact', head: true })
                .eq("org_id", orgId)
                .eq("suggestion_type", "revenue_drop")
                .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            if (count === 0) {
                await supabase.from("copilot_suggestions").insert({
                    org_id: orgId,
                    suggestion_type: "revenue_drop",
                    category: "revenue",
                    title: "Queda de Faturamento Detectada",
                    description: `Seu faturamento caiu ${Math.abs(Math.round(latest.wow_change_pct))}% em relação à semana passada. Verifique o funil de vendas.`,
                    priority: "high",
                    status: "active"
                });
            }
        }
    }

    // 2. Check for Overdue Bulge
    // Logic: If overdue > 10% of total sold
    // (Omitted for brevity but could follow similar pattern)
}

export async function dismissSuggestion(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("copilot_suggestions")
        .update({ status: "dismissed", dismissed_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}

export async function markSuggestionComplete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("copilot_suggestions")
        .update({ status: "completed", applied_at: new Date().toISOString() })
        .eq("id", id);

    if (error) throw error;
}
