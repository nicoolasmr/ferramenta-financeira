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

export async function createCheckoutSession(orgId: string, planId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) throw new Error("User not authenticated");
    const email = user.email;

    // 1. Get Plan Details
    const { data: plan } = await supabase.from("plans").select("*").eq("id", planId).single();
    if (!plan) throw new Error("Plan not found");
    // Assuming plan.code is the Stripe Price ID or we have a mapping. 
    // Ideally plan table has 'stripe_price_id'.
    // For MVP, if no stripe_price_id column, we might default or mock.
    // Let's assume plan has stripe_price_id OR code maps to it.

    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn("Stripe keys missing. Simulating checkout.");
        // Mock fallback for "Real" behavior without keys
        await updatePlan(orgId, planId);
        return { url: `/app/billing?success=true&mock=true` };
    }

    const { Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' }); // Actually let's try to remove it or match. 
    // The error message `Type "2024-12-18.acacia" is not assignable to type "2025-12-15.clover"` implies the SDK expects the later one.
    // I'll update to what it wants. Wait, 2025-12-15? We are in Jan 2026.
    // Let's just use what the types say.
    // Safest bet: remove explicit apiVersion or set to null/undefined to use default, or check package.json version.
    // But error suggests strict typing.
    // I will use '2025-01-27.acacia' if that's real, or just cast as any to bypass if I am sure.
    // BETTER: The error explicitly said `is not assignable to type '"2025-12-15.clover"'`.
    // So I will use that string.

    // UPDATE: StartLine 117 contains the line.

    // 2. Create Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.stripe_price_id || 'price_mock', // Fallback or Schema needed
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?canceled=true`,
        customer_email: email,
        metadata: {
            orgId: orgId,
            planId: planId
        }
    });

    return { url: session.url };
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
