import { BankProviderAdapter, BankAccount, BankTransaction } from "./types";

/**
 * AggregatorGeneric: A reference implementation for a generic bank aggregator.
 * This can be used as a template for Belvo, Pluggy, etc.
 */
export class AggregatorGeneric implements BankProviderAdapter {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.BANK_AGGREGATOR_API_KEY || "";
        this.baseUrl = process.env.BANK_AGGREGATOR_BASE_URL || "https://api.aggregator.io";
    }

    async getConnectUrl(org_id: string, project_id?: string): Promise<string> {
        // Mocking the call to the aggregator to get a widget URL
        console.log(`AggregatorGeneric: Generating connect URL for org ${org_id}`);
        return `${this.baseUrl}/connect?org=${org_id}&project=${project_id || ""}&key=${this.apiKey}`;
    }

    async exchangeToken(public_token: string): Promise<{ connection_id: string; config: any }> {
        // Mocking token exchange
        return {
            connection_id: `conn_${Math.random().toString(36).substr(2, 9)}`,
            config: {
                access_token: `at_${Math.random().toString(36).substr(2, 20)}`,
                refresh_token: `rt_${Math.random().toString(36).substr(2, 20)}`,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        };
    }

    async getAccounts(connection_id: string, config: any): Promise<BankAccount[]> {
        // Mocking account fetch
        return [
            {
                id: "acc_1",
                name: "Main checking",
                type: "checking",
                currency: "BRL",
                balance_cents: 1000000,
                mask_last4: "1234",
                institution_name: "Bank of Moat"
            }
        ];
    }

    async getTransactions(
        connection_id: string,
        account_id: string,
        config: any,
        startDate: Date,
        endDate: Date
    ): Promise<BankTransaction[]> {
        // Mocking transaction fetch
        return [
            {
                external_id: `tx_${Math.random().toString(36).substr(2, 9)}`,
                amount_cents: 500000, // +R$ 5.000,00 credit
                description: "STRIPE PAYOUT",
                occurred_at: new Date(),
                category: "payout",
                raw_payload: { original: "Stripe payout x123" }
            },
            {
                external_id: `tx_${Math.random().toString(36).substr(2, 9)}`,
                amount_cents: -15000, // -R$ 150,00 debit
                description: "OFFICE SUPPLIES",
                occurred_at: new Date(Date.now() - 86400000),
                category: "expense",
                raw_payload: { original: "Amazon office" }
            }
        ];
    }

    async refreshConnection(connection_id: string, config: any): Promise<{ status: string; config?: any }> {
        return { status: "connected" };
    }

    async handleWebhook(payload: any, signature?: string): Promise<{ processed: boolean; event: string }> {
        return { processed: true, event: "transaction.created" };
    }
}
