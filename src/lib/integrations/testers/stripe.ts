import type { TestResult } from '../types';

export async function testStripeConnection(apiKey: string): Promise<TestResult> {
    try {
        // Validate API key format
        if (!apiKey || !apiKey.startsWith('sk_')) {
            return {
                success: false,
                message: 'Invalid Stripe API key format. Key should start with "sk_"',
                error: 'INVALID_FORMAT'
            };
        }

        // Make a test API call to Stripe
        const response = await fetch('https://api.stripe.com/v1/balance', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: error.error?.message || 'Failed to connect to Stripe',
                error: error.error?.code || 'CONNECTION_FAILED'
            };
        }

        const data = await response.json();

        return {
            success: true,
            message: 'Successfully connected to Stripe!',
            details: {
                currency: data.available?.[0]?.currency || 'USD',
                livemode: data.livemode,
                available: data.available?.[0]?.amount || 0
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to test Stripe connection',
            error: 'NETWORK_ERROR'
        };
    }
}
