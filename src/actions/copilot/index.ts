"use server";

import { createClient } from "@/lib/supabase/server";

export interface CopilotSuggestion {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
    action_url?: string;
    created_at: string;
}

export async function getCopilotSuggestions(orgId: string): Promise<CopilotSuggestion[]> {
    const supabase = await createClient();
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

export async function dismissSuggestion(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("copilot_suggestions")
        .update({ status: "dismissed" })
        .eq("id", id);

    if (error) throw error;
}

export async function markSuggestionComplete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("copilot_suggestions")
        .update({ status: "completed" })
        .eq("id", id);

    if (error) throw error;
}
