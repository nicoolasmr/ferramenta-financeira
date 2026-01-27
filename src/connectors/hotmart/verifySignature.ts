import { NextRequest } from "next/server";
import { SignatureVerificationResult } from "../_shared/types";

export async function verifySignature(req: NextRequest, body: string): Promise<SignatureVerificationResult> {
    // Hotmart usually sends the token in the headers as "X-Hotmart-Hottok" or inside the body.
    // For this implementation, we check the header 'hottok' or 'x-hotmart-hottok' 
    // AND compare with env var.

    // Note: Parsing body again to check internal hottok if header is missing is expensive if body is large,
    // but typical Hotmart payloads are small.
    // However, clean architecture prefers header check.

    const hottok = req.headers.get("hottok") || req.headers.get("x-hotmart-hottok");
    const secret = process.env.HOTMART_HOTTOK;

    if (!secret) return { isValid: true }; // If no secret configured, open (Tier 2 behavior) -- Dangerous but MVP friendly.

    if (hottok === secret) return { isValid: true };

    // Fallback: check body if not in header (legacy). 
    // We already have body as string.
    try {
        const json = JSON.parse(body);
        if (json.hottok === secret) return { isValid: true };
    } catch { }

    return { isValid: false, reason: "Invalid Hotmart Token" };
}
