import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    typescript: true,
});

export async function createCheckoutSession(orgId: string, planCode: string, userEmail: string) {
    // Defines PRICE IDs map locally or fetched from DB. 
    // Ideally these are env vars for flexibility.
    const priceMap: Record<string, string | undefined> = {
        'starter': process.env.STRIPE_PRICE_STARTER,
        'pro': process.env.STRIPE_PRICE_PRO,
        'agency': process.env.STRIPE_PRICE_AGENCY,
    };

    const priceId = priceMap[planCode];
    if (!priceId) throw new Error("Invalid plan code or missing price configuration");

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer_email: userEmail,
        client_reference_id: orgId,
        metadata: {
            orgId: orgId,
            planCode: planCode
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing?canceled=true`,
    });

    return session.url;
}

export async function createPortalSession(orgId: string) {
    const supabase = await createClient();

    const { data: subscription } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("org_id", orgId)
        .single();

    if (!subscription?.stripe_customer_id) {
        throw new Error("No Stripe customer found for this organization");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing`,
    });

    return session.url;
}
