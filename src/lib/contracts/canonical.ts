/**
 * Canonical Data Contracts for RevenueOS (Data Truth Layer)
 * 
 * Standardized types and enums for all financial providers.
 */

// --- Base Types ---

export type Money = {
    amount_cents: number;
    currency: string; // "BRL" usually
};

export type CanonicalProvider =
    | "stripe"
    | "belvo"
    | "hotmart"
    | "asaas"
    | "kiwify"
    | "lastlink"
    | "mercadopago"
    | "eduzz";

export type Environment = "sandbox" | "production";

// --- Enums ---

export enum OrderStatus {
    CREATED = "created",
    CONFIRMED = "confirmed", // Paid or verified
    CANCELED = "canceled",
    REFUNDED = "refunded",
    CHARGEBACK = "chargeback",
    DISPUTED = "disputed",
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
    CHARGEBACK = "chargeback",
}

export enum PayoutStatus {
    PENDING = "pending",
    PAID = "paid", // Available in destination account
    FAILED = "failed",
    CANCELED = "canceled",
}

export enum InstallmentStatus {
    OPEN = "open",
    PAID = "paid",
    OVERDUE = "overdue",
    RENEGOTIATED = "renegotiated",
    CANCELED = "canceled",
}

// --- Canonical Event Entity ---

export interface CanonicalEvent {
    // Unique ID for the canonical event (generated)
    id?: string;

    // Context
    org_id: string;
    project_id?: string;
    env: Environment;

    // Metadata
    provider: CanonicalProvider;
    provider_event_type: string;
    occurred_at: string; // ISO String

    // The core payload type
    domain_type: "order" | "payment" | "payout" | "refund" | "dispute" | "bank_transaction";

    // The standardized data (one of the interfaces below)
    data: CanonicalOrder | CanonicalPayment | CanonicalPayout | CanonicalBankTransaction;

    // Raw references for traceability
    refs: {
        provider_object_id: string;
        provider_related_id?: string; // e.g. order_id for a payment
        link_id?: string; // For bank connections
    };
}

// --- Domain Interfaces ---

export interface CanonicalOrder {
    customer: {
        name: string;
        email: string;
        document?: string;
        phone?: string;
        external_id?: string;
    };
    products: Array<{
        name: string;
        quantity: number;
        price_cents: number;
    }>;
    total_cents: number;
    currency: string;
    status: OrderStatus;
}

export interface CanonicalPayment {
    order_id?: string; // Reference to canonical order ID if known
    method: "credit_card" | "pix" | "boleto" | "transfer" | "other";
    installments: number; // 1 = full payment
    amount_cents: number;
    fee_cents: number; // Processing fee
    net_cents: number; // amount - fee
    currency: string;
    status: PaymentStatus;
    paid_at?: string;
}

export interface CanonicalPayout {
    destination_bank?: string;
    amount_cents: number;
    fee_cents: number;
    net_cents: number;
    currency: string;
    status: PayoutStatus;
    payout_date: string; // Expected or actual availability
}

export interface CanonicalBankTransaction {
    account_id: string; // Internal or external reference
    description: string;
    amount_cents: number;
    direction: "credit" | "debit";
    category?: string;
    merchant_name?: string;
    balance_after_cents?: number;
    posted_at: string;
}
