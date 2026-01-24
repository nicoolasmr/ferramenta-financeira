
import { createClient } from "@/lib/supabase/server";

export type Entitlement = 'backfill' | 'dunning_automation' | 'trust_center' | 'unlimited_integrations';

// PLAN DEFINITIONS (Sync with your database/constants)
const PLAN_LIMITS = {
    starter: {
        events_processed: 1000,
        integrations: 1,
        backfill: false,
        dunning_automation: false
    },
    pro: {
        events_processed: 50000,
        integrations: 5,
        backfill: true,
        dunning_automation: true
    },
    enterprise: {
        events_processed: 999999999,
        integrations: 999,
        backfill: true,
        dunning_automation: true
    }
};

export async function checkEntitlement(orgId: string, feature: Entitlement): Promise<boolean> {
    const supabase = await createClient();

    // 1. Get Plan
    const { data: sub } = await supabase.from('subscriptions')
        .select('plan')
        .eq('org_id', orgId)
        .single();

    const plan = (sub?.plan || 'starter') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan];

    // 2. Check Logic
    if (feature === 'backfill') return limits.backfill;
    if (feature === 'dunning_automation') return limits.dunning_automation;

    return false;
}

export async function checkLimit(orgId: string, metric: 'events_processed' | 'integrations'): Promise<{ ok: boolean; usage: number; limit: number }> {
    const supabase = await createClient();

    // 1. Get Plan
    const { data: sub } = await supabase.from('subscriptions')
        .select('plan')
        .eq('org_id', orgId)
        .single();
    const plan = (sub?.plan || 'starter') as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan][metric];

    // 2. Get Usage
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    let usage = 0;

    if (metric === 'events_processed') {
        const { data } = await supabase.from('usage_events')
            .select('events_processed')
            .eq('org_id', orgId)
            .eq('period_month', currentMonth)
            .single();
        usage = data?.events_processed || 0;
    } else if (metric === 'integrations') {
        // Count active webhook keys or integrations table
        // Simplified: assuming usage_events tracks active integrations snapshot or we query directly
        const { count } = await supabase.from('project_webhook_keys')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', orgId)
            .eq('active', true);
        usage = count || 0;
    }

    return { ok: usage < limit, usage, limit };
}
