import { NextRequest } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { SignatureVerificationResult } from "../_shared/types";

export async function verifySignature(req: NextRequest, body: string): Promise<SignatureVerificationResult> {
    const signature = req.headers.get("Stripe-Signature");

    if (!signature) {
        return { isValid: false, reason: "Missing Stripe-Signature header" };
    }

    try {
        stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        return { isValid: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { isValid: false, reason: message };
    }
}
