
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDecisionActions(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('decision_actions_view')
        .select('*')
        .eq('org_id', orgId)
        .limit(5);

    if (error) throw error;
    return data;
}

export async function getPortfolioHealth(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('portfolio_health_view')
        .select('*')
        .eq('org_id', orgId)
        .order('health_score', { ascending: true }); // Worst first (risk)

    if (error) throw error;
    return data;
}

export async function inspectLineage(entityType: string, id: string) {
    const supabase = await createClient();
    // This is a placeholder for real lineage logic.
    // In v2.2, we simulate response based on external_refs.

    // 1. Try to find external_ref
    const { data: extRef } = await supabase
        .from('external_refs')
        .select('*')
        .eq('canonical_id', id)
        .single();

    return {
        entity_id: id,
        provider: extRef?.provider || 'unknown',
        external_id: extRef?.provider_object_id
    };
}
