
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { createClient } from "@/lib/supabase/client";

// Stub for Stripe public key - in prod env var
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "pk_test_sample");

export async function checkout_subscription(priceId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In Real App: Call Server Action -> Create Checkout Session -> Return ID
    console.log("Mocking Checkout Redirect for Price:", priceId);

    // Simulate Success
    alert(`Redirecionando para Stripe Checkout (Plan ${priceId})...\n\n(Em produção, isso abriria o checkout real)`);
    return;
}

export async function manage_billing() {
    // In Real App: Call Server Action -> Create Billing Portal Session -> Return URL
    console.log("Mocking Portal Redirect");
    alert("Redirecionando para Stripe Portal...\n\n(Em produção, isso abriria o portal de faturas)");
}
