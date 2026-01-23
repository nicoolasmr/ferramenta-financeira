/**
 * Matching Engine (Deterministic)
 * Core logic for "Caixa Real" reconciliation between Payout Events and Bank Transactions.
 */

export interface PayoutEvent {
    id: string;
    payout_date: string;
    amount_cents: number;
    fees_cents: number;
    net_amount_cents: number;
}

export interface BankTransactionNormalized {
    id: string;
    tx_date: string;
    amount_cents: number;
    description: string;
}

export interface MatchResult {
    payout_id: string;
    bank_tx_id: string;
    confidence: number; // 0-100
    reason: 'exact_amount_date' | 'tolerance_fees' | 'score_matching';
}

/**
 * findBestMatch
 * Logic:
 * 1. Exact match: same net_amount and date within ±1 day.
 * 2. Tolerance match: net_amount matches payout.amount - calculated_fees.
 * 3. Score matching: based on description similarity + date proximity.
 */
export function findBestMatch(
    payout: PayoutEvent,
    candidates: BankTransactionNormalized[]
): MatchResult | null {
    if (candidates.length === 0) return null;

    const payoutDate = new Date(payout.payout_date);

    for (const tx of candidates) {
        const txDate = new Date(tx.tx_date);
        const dateDiffDays = Math.abs(txDate.getTime() - payoutDate.getTime()) / (1000 * 60 * 60 * 24);

        // 1. Exact Match (The Holy Grail)
        if (dateDiffDays <= 1 && tx.amount_cents === payout.net_amount_cents) {
            return {
                payout_id: payout.id,
                bank_tx_id: tx.id,
                confidence: 100,
                reason: 'exact_amount_date'
            };
        }

        // 2. Tolerance Match (Fees vary slightly)
        // If amount matches total amount (before fees) or net amount with small leeway
        const tolerance = 500; // 5 BRL tolerance for unknown fee variances
        if (dateDiffDays <= 2 && Math.abs(tx.amount_cents - payout.net_amount_cents) <= tolerance) {
            return {
                payout_id: payout.id,
                bank_tx_id: tx.id,
                confidence: 90,
                reason: 'tolerance_fees'
            };
        }
    }

    // 3. Score-based matching for the best candidate if no high-confidence match found
    const scoredMatches = candidates.map(tx => {
        let score = 0;
        const txDate = new Date(tx.tx_date);
        const dateDiffDays = Math.abs(txDate.getTime() - payoutDate.getTime()) / (1000 * 60 * 60 * 24);

        // Value proximity (up to 60 points)
        const valueDiff = Math.abs(tx.amount_cents - payout.net_amount_cents);
        if (valueDiff === 0) score += 60;
        else if (valueDiff < 500) score += 40;
        else if (valueDiff < 2000) score += 20;

        // Date proximity (up to 30 points)
        if (dateDiffDays <= 1) score += 30;
        else if (dateDiffDays <= 3) score += 15;
        else if (dateDiffDays <= 7) score += 5;

        // Description keyword match (up to 10 points)
        const descMatch = tx.description.toLowerCase().includes('payout') ||
            tx.description.toLowerCase().includes('stripe') ||
            tx.description.toLowerCase().includes('hotmart');
        if (descMatch) score += 10;

        return { tx, score };
    }).sort((a, b) => b.score - a.score);

    const best = scoredMatches[0];
    if (best && best.score >= 50) {
        return {
            payout_id: payout.id,
            bank_tx_id: best.tx.id,
            confidence: best.score,
            reason: 'score_matching'
        };
    }

    return null;
}
