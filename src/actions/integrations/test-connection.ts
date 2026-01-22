"use server";

import { testStripeConnection, testHotmartConnection, testAsaasConnection, type TestResult } from "@/lib/integrations/testers";

export async function testConnection(
    provider: string,
    credentials: Record<string, string>
): Promise<TestResult> {
    try {
        switch (provider.toLowerCase()) {
            case 'stripe':
                if (!credentials.api_key) {
                    return {
                        success: false,
                        message: 'API Key is required',
                        error: 'MISSING_API_KEY'
                    };
                }
                return await testStripeConnection(credentials.api_key);

            case 'hotmart':
                if (!credentials.client_id || !credentials.client_secret) {
                    return {
                        success: false,
                        message: 'Client ID and Client Secret are required',
                        error: 'MISSING_CREDENTIALS'
                    };
                }
                return await testHotmartConnection(credentials.client_id, credentials.client_secret);

            case 'asaas':
                if (!credentials.api_key) {
                    return {
                        success: false,
                        message: 'API Key is required',
                        error: 'MISSING_API_KEY'
                    };
                }
                return await testAsaasConnection(credentials.api_key);

            case 'eduzz':
            case 'kiwify':
            case 'lastlink':
                // For providers without API testing yet, return a mock success
                return {
                    success: true,
                    message: `Credentials saved for ${provider}. Connection test not available yet.`,
                    details: { provider }
                };

            default:
                return {
                    success: false,
                    message: `Provider "${provider}" is not supported`,
                    error: 'UNSUPPORTED_PROVIDER'
                };
        }
    } catch (error: any) {
        console.error('Test connection error:', error);
        return {
            success: false,
            message: error.message || 'Failed to test connection',
            error: 'UNEXPECTED_ERROR'
        };
    }
}
