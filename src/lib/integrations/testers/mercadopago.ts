
import { TestResult } from "../types";

export async function testMercadoPagoConnection(accessToken: string): Promise<TestResult> {
    try {
        const response = await fetch("https://api.mercadopago.com/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return {
                success: false,
                message: "Failed to connect to Mercado Pago",
                error: error.message || error.error || response.statusText
            };
        }

        const data = await response.json();

        return {
            success: true,
            message: `Connected to Mercado Pago as ${data.first_name || 'User'} (${data.nickname || data.id})`,
            details: {
                user_id: data.id,
                email: data.email,
                site_id: data.site_id
            }
        };

    } catch (error: any) {
        return {
            success: false,
            message: "Network error connecting to Mercado Pago",
            error: error.message
        };
    }
}
