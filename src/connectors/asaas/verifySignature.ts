import { NextRequest } from "next/server";
import { SignatureVerificationResult } from "../_shared/types";

export async function verifySignature(req: NextRequest, body: string): Promise<SignatureVerificationResult> {
    const token = req.headers.get("asaas-access-token");
    const secret = process.env.ASAAS_WEBHOOK_TOKEN; // Different from API Key

    if (!secret) return { isValid: true }; // Open if not configured

    if (token === secret) return { isValid: true };

    return { isValid: false, reason: "Invalid Asaas Token" };
}
