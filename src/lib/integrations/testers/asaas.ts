import type { TestResult } from '../types';

export async function testAsaasConnection(apiKey: string): Promise<TestResult> {
    try {
        if (!apiKey || !apiKey.startsWith('$aact_')) {
            return {
                success: false,
                message: 'Invalid Asaas API key format. Key should start with "$aact_"',
                error: 'INVALID_FORMAT'
            };
        }

        // Test API call to Asaas
        const response = await fetch('https://www.asaas.com/api/v3/customers?limit=1', {
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: error.errors?.[0]?.description || 'Failed to connect to Asaas',
                error: 'INVALID_CREDENTIALS'
            };
        }

        const data = await response.json();

        return {
            success: true,
            message: 'Successfully connected to Asaas!',
            details: {
                totalCount: data.totalCount || 0,
                hasMore: data.hasMore || false
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to test Asaas connection',
            error: 'NETWORK_ERROR'
        };
    }
}
