import { createClient } from "@/lib/supabase/server";

export async function hasFeature(orgId: string, featureKey: string): Promise<boolean> {
    const supabase = await createClient();
    // 1. Check cached entitlements first
    const { data: ent } = await supabase.from("entitlements").select("features").eq("org_id", orgId).single();

    if (ent?.features?.includes(featureKey)) return true;

    // 2. Fallback: Check Plan directly (if entitlements not synced yet)
    const { data: sub } = await supabase.from("subscriptions").select("plan_id, plans(features)").eq("org_id", orgId).single();
    if (sub?.plans?.features?.includes(featureKey)) return true;

    return false;
}

export async function checkLimit(orgId: string, resource: string, currentCount: number): Promise<boolean> {
    const supabase = await createClient();
    const { data: ent } = await supabase.from("entitlements").select("limits").eq("org_id", orgId).single();

    const limit = ent?.limits?.[resource];
    if (limit === undefined || limit === -1) return true; // Unlimited

    return currentCount < limit;
}
