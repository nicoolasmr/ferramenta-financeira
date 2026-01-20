import { headers } from "next/headers";
import { stripe } from "@/lib/billing/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const subscription = event.data.object as Stripe.Subscription;
    const supabase = await createClient();

    if (event.type === "checkout.session.completed") {
        if (!session?.metadata?.orgId) {
            return new NextResponse("Org ID missing in metadata", { status: 400 });
        }

        // Fulfill the order: Update subscription status
        // Usually we fetch the subscription status from Stripe or simply mark as active if paid
        const subscriptionId = session.subscription as string;

        await supabase.from("subscriptions").upsert({
            org_id: session.metadata.orgId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            status: "active", // Simplified. Real world: check sub status
            provider: "stripe",
            updated_at: new Date().toISOString()
        }, { onConflict: "org_id" });

        // Update Plan ID based on metadata
        if (session.metadata.planCode) {
            const { data: plan } = await supabase.from("plans").select("id").eq("code", session.metadata.planCode).single();
            if (plan) {
                await supabase.from("subscriptions").update({ plan_id: plan.id }).eq("org_id", session.metadata.orgId);
            }
        }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
        const stripeSubId = subscription.id;
        // Find org by subscription ID
        const { data: subRecord } = await supabase.from("subscriptions").select("org_id").eq("stripe_subscription_id", stripeSubId).single();

        if (subRecord) {
            await supabase.from("subscriptions").update({
                status: subscription.status,
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
            }).eq("org_id", subRecord.org_id);
        }
    }

    return new NextResponse(null, { status: 200 });
}
