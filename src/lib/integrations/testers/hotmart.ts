import type { TestResult } from '../types';

export async function testHotmartConnection(
    clientId: string,
    clientSecret: string
): Promise<TestResult> {
    try {
        if (!clientId || !clientSecret) {
            return {
                success: false,
                message: 'Client ID and Client Secret are required',
                error: 'MISSING_CREDENTIALS'
            };
        }

        // Test OAuth token generation
        const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            body: JSON.stringify({
                grant_type: 'client_credentials'
            })
        });

        if (!tokenResponse.ok) {
            return {
                success: false,
                message: 'Invalid Hotmart credentials',
                error: 'INVALID_CREDENTIALS'
            };
        }

        const tokenData = await tokenResponse.json();

        return {
            success: true,
            message: 'Successfully connected to Hotmart!',
            details: {
                tokenType: tokenData.token_type,
                expiresIn: tokenData.expires_in
            }
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to test Hotmart connection',
            error: 'NETWORK_ERROR'
        };
    }
}
