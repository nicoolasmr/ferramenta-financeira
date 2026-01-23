"use client";

const BELVO_SECRET_ID = process.env.BELVO_SECRET_ID;
const BELVO_SECRET_PASSWORD = process.env.BELVO_SECRET_PASSWORD;
const BELVO_BASE_URL = process.env.BELVO_BASE_URL || "https://sandbox.belvo.com";

/**
 * Belvo API Client (Server-side only)
 */
export async function belvoFetch(path: string, method: string = "GET", body?: any) {
    if (typeof window !== "undefined") {
        throw new Error("belvoFetch must only be called from the server.");
    }

    if (!BELVO_SECRET_ID || !BELVO_SECRET_PASSWORD) {
        throw new Error("Belvo credentials not configured.");
    }

    const auth = Buffer.from(`${BELVO_SECRET_ID}:${BELVO_SECRET_PASSWORD}`).toString("base64");

    const response = await fetch(`${BELVO_BASE_URL}${path}`, {
        method,
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`Belvo API Error (${path}):`, error);
        throw new Error(error.message || `Belvo API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Create a Widget Access Token
 * @param callback_urls success, exit, event
 * @param external_user_id unique ID for the user
 */
export async function createWidgetAccessToken(callback_urls: { success: string, exit: string, event: string }, external_user_id?: string) {
    return belvoFetch("/api/token/", "POST", {
        id: external_user_id,
        ...callback_urls
    });
}

/**
 * Get accounts for a specific link
 */
export async function getAccounts(link_id: string) {
    return belvoFetch(`/api/accounts/?link=${link_id}`);
}

/**
 * Get transactions for a specific link and date range
 */
export async function getTransactions(link_id: string, date_from: string, date_to: string) {
    return belvoFetch("/api/transactions/", "POST", {
        link: link_id,
        date_from,
        date_to,
        save_data: true // Always save to retrieve via API
    });
}

/**
 * Refresh a link to get latest data
 */
export async function refreshLink(link_id: string) {
    return belvoFetch(`/api/links/${link_id}/refresh/`, "POST");
}
