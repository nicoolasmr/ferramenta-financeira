
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
