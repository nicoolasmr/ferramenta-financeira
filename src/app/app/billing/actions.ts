"use server";

import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/billing/stripe";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function manageSubscriptionAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch user's org (Assuming context or single org for MVP)
    const { data: membership } = await supabase.from("memberships").select("org_id").eq("user_id", user.id).single();
    if (!membership) throw new Error("No organization found");

    const url = await createPortalSession(membership.org_id);
    redirect(url);
}

export async function upgradePlanAction(planCode: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: membership } = await supabase.from("memberships").select("org_id").eq("user_id", user.id).single();
    if (!membership) throw new Error("No organization found");

    const url = await createCheckoutSession(membership.org_id, planCode, user.email || "");
    if (url) redirect(url);
}
