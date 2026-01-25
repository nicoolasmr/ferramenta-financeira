
import { CanonicalModule, CanonicalType } from "./canonical/types";

export type ProviderKey = 'stripe' | 'hotmart' | 'asaas' | 'kiwify' | 'lastlink' | 'eduzz' | 'monetizze' | 'mercadopago' | 'pagseguro' | 'belvo' | string;

export interface CapabilityMatrix {
    webhooks: boolean;
    backfill: boolean;
    subscriptions: boolean;
    payouts: boolean;
    disputes: boolean;
    refunds: boolean;
    installments: boolean;
    commissions: boolean;
    affiliates: boolean;
    multi_currency: boolean;
}

export type VerificationKind = 'hmac_signature' | 'header_token' | 'query_token' | 'jwt' | 'none';

export type SetupField = {
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'boolean';
    placeholder?: string;
    required: boolean;
    description?: string;
    defaultValue?: string;
    help?: string;
};

export type WebhookConfig = {
    webhookUrl: string;
    verificationKind: VerificationKind;
    fields: SetupField[];
    instructions: { step: number; title: string; description: string; action?: { label: string; url: string } }[];
    recommendedEvents: { code: string; label: string }[];
};

export interface NormalizedEvent {
    provider_key: ProviderKey;
    project_id: string;
    org_id: string;
    trace_id: string;
    external_event_id: string;
    occurred_at: string;
    canonical_module: CanonicalModule;
    canonical_type: CanonicalType;
    payload: Record<string, any>; // Clean standardized payload
    data?: any; // Canonical Data Object (Order, Payment, etc.)
    money?: { amount_cents: number; currency: string };
    external_refs: { kind: string; external_id: string }[];
}

export interface ProviderConnector {
    providerKey: ProviderKey;
    displayName: string;

    capabilities: CapabilityMatrix;

    getSetupConfig(projectId: string): Promise<WebhookConfig>;

    verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }>;

    normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]>;

    apply(evt: NormalizedEvent, ctx: { org_id: string; project_id: string }): Promise<{ applied: boolean }>;


    triggerBackfill?(projectId: string, secrets: Record<string, string>, startFrom?: Date): Promise<string>; // Returns Job ID
}

export function verifyWebhookSignature(
    kind: VerificationKind,
    payload: string,
    headers: Record<string, string>,
    secrets: Record<string, string>,
    options?: { signatureHeader?: string; secretKey?: string }
): { ok: boolean; reason?: string } {

    // 1. None
    if (kind === 'none') return { ok: true };

    // 2. Query/Header Token (Exact Match)
    // Used by: Kiwify, Asaas (AccessToken)
    if (kind === 'header_token' || kind === 'query_token') {
        // We look for logic inside the payload (Kiwify sends it in body) or header

        // Kiwify Specific Logic (Legacy Support until V2)
        try {
            const bodyJson = JSON.parse(payload);
            const secret = secrets[options?.secretKey || 'token'] || secrets['access_token'];

            if (!secret) return { ok: false, reason: "Secret not configured" };

            // Check body first (Kiwify style)
            if (bodyJson.signature === secret) return { ok: true };
            if (bodyJson.token === secret) return { ok: true };

            // Check headers
            const headerSig = headers[options?.signatureHeader || 'x-token'];
            if (headerSig === secret) return { ok: true };

            return { ok: false, reason: "Token mismatch" };
        } catch (e) {
            return { ok: false, reason: "Invalid JSON body" };
        }
    }

    // 3. HMAC Signature (Standard)
    // Used by: MercadoPago, Stripe, Hotmart (some versions)
    if (kind === 'hmac_signature') {
        const secret = secrets[options?.secretKey || 'access_token'];
        if (!secret) return { ok: false, reason: "Secret not configured" };

        const sig = headers[options?.signatureHeader || 'x-signature'];
        if (!sig) return { ok: false, reason: "Missing signature header" };

        // MercadoPago Logic (Placeholder for full crypto implementation)
        // TODO: Import crypto and do createHmac('sha256', ...)
        // For now, checks presence
        return { ok: true };
    }

    return { ok: false, reason: "Unknown verification kind" };
}
