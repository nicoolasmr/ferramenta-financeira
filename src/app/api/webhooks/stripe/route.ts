import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("Stripe config missing");
        return new NextResponse("Stripe config missing", { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook Signature Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const supabase = await createClient();
    // Use admin client if RLS blocks webhooks (usually webhooks run as generic, but supabase server client uses auth context if available, here it won't be user auth)
    // Actually standard createClient might be anon if no cookie. 
    // We should use service role for webhooks to be safe and bypass RLS.
    // Importing admin client from previous refactor.
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = getAdminClient();

    if (!adminSupabase) {
        return new NextResponse("Server Config Error", { status: 500 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const orgId = session.metadata?.orgId;
                const planId = session.metadata?.planId;

                if (orgId && planId) {
                    // Upsert subscription
                    // We trust metadata passed from our checkout creation
                    await adminSupabase.from("subscriptions").upsert({
                        org_id: orgId,
                        plan_id: planId,
                        status: "active",
                        provider: "stripe",
                        external_id: session.subscription as string,
                        updated_at: new Date().toISOString()
                    }, { onConflict: "org_id" });
                }
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;

                // Find org by subscription ID (external_id)
                // This assumes we stored it during checkout
                // If not found, we can't update.

                // Ideally we'd query by external_id, but our schema might need to ensure external_id is stored
                // The upsert above stores it.

                // Update current_period_end if available in invoice lines or fetch sub
                if (subscriptionId) {
                    const { data: sub } = await adminSupabase.from("subscriptions").select("org_id").eq("external_id", subscriptionId).single();
                    if (sub) {
                        // We could update expiry here if we had the column
                        // For now just ensure status is active
                        await adminSupabase.from("subscriptions").update({
                            status: "active",
                            updated_at: new Date().toISOString()
                        }).eq("org_id", sub.org_id);
                    }
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const { data: sub } = await adminSupabase.from("subscriptions").select("org_id").eq("external_id", subscription.id).single();

                if (sub) {
                    await adminSupabase.from("subscriptions").update({
                        status: "canceled",
                        updated_at: new Date().toISOString()
                    }).eq("org_id", sub.org_id);
                }
                break;
            }
        }
    } catch (error: any) {
        console.error(`Webhook Handler Error: ${error.message}`);
        return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
