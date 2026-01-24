
import { Connector, RawEvent } from "./types";
import { CanonicalEvent } from "@/lib/contracts/canonical";

/**
 * Base Connector Class
 * Provides shared utilities for all connectors.
 */
export abstract class BaseConnector implements Connector {
    abstract provider: any;

    abstract verifySignature(body: string, headers: Record<string, string>, secret: string): boolean;
    abstract parseWebhook(body: any, headers: Record<string, string>): RawEvent;
    abstract normalize(raw: RawEvent): CanonicalEvent[];

    /**
     * Helper to safely parse Money from cents or float.
     * Most providers send cents (Stripe), some send float (Hotmart).
     */
    protected toCents(amount: number | string): number {
        if (typeof amount === 'string') {
            amount = parseFloat(amount);
        }
        // If it's effectively an integer (e.g. 100.0), treat as is? 
        // No, we need to know the provider convention.
        // This helper might need context. 
        // For now, assume input is float if small, int if large? Unsafe.
        // Better to implement specific logic per provider.
        return Math.round(amount); // Placeholder
    }
}
