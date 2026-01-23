export interface BankAccount {
    id: string;
    name: string;
    type?: string;
    currency: string;
    balance_cents: number;
    mask_last4?: string;
    institution_name?: string;
}

export interface BankTransaction {
    external_id: string;
    amount_cents: number; // signed (+credit, -debit)
    description: string;
    occurred_at: Date;
    counterparty?: string;
    category?: string;
    raw_payload: any;
}

export interface BankConnectionResult {
    connection_id: string;
    status: 'connected' | 'needs_reauth' | 'error' | 'revoked';
    accounts: BankAccount[];
}

/**
 * Interface standard for any Bank Aggregator or Direct Open Finance Provider
 */
export interface BankProviderAdapter {
    /**
     * Get the connect URL to redirect the user for consent
     */
    getConnectUrl(org_id: string, project_id?: string): Promise<string>;

    /**
     * Exchange a temporary token or callback ID for a permanent connection_id
     */
    exchangeToken(public_token: string): Promise<{ connection_id: string; config: any }>;

    /**
     * Fetch accounts for a given connection
     */
    getAccounts(connection_id: string, config: any): Promise<BankAccount[]>;

    /**
     * Fetch transactions for a specific account and date range
     */
    getTransactions(
        connection_id: string,
        account_id: string,
        config: any,
        startDate: Date,
        endDate: Date
    ): Promise<BankTransaction[]>;

    /**
     * Refresh connection status or tokens if needed
     */
    refreshConnection(connection_id: string, config: any): Promise<{ status: string; config?: any }>;

    /**
     * Handle incoming webhooks from the provider
     */
    handleWebhook(payload: any, signature?: string): Promise<{ processed: boolean; event: string }>;
}
