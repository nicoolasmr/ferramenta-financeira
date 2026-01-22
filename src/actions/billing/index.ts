"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Plan {
    id: string;
    code: string;
    name: string;
    price_cents: number;
    currency: string;
    limits: any;
    features: any;
}

export interface Subscription {
    id: string;
    org_id: string;
    status: string;
    plan_id: string;
    current_period_end?: string;
    cancel_at_period_end: boolean;
    plan?: Plan;
}

export async function getAvailablePlans(): Promise<Plan[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("price_cents", { ascending: true });

    if (error) {
        console.error("Error fetching plans:", error);
        return [];
    }

    return data || [];
}

export async function getBillingInfo(orgId: string): Promise<Subscription | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("org_id", orgId)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error);
        return null;
    }

    return data;
}

export async function updatePlan(orgId: string, planId: string) {
    const supabase = await createClient();

    // Check if subscription exists
    const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("org_id", orgId)
        .single();

    if (existing) {
        const { error } = await supabase
            .from("subscriptions")
            .update({
                plan_id: planId,
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("org_id", orgId);

        if (error) throw new Error("Failed to update plan");
    } else {
        const { error } = await supabase
            .from("subscriptions")
            .insert({
                org_id: orgId,
                plan_id: planId,
                status: "active",
                provider: "stripe_mock", // Mocking provider for now
            });

        if (error) throw new Error("Failed to create subscription");
    }

    revalidatePath("/app/billing");
}

export async function cancelSubscription(orgId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("org_id", orgId);

    if (error) throw new Error("Failed to cancel subscription");
    revalidatePath("/app/billing");
}
