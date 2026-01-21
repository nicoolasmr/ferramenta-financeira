
import { ProjectFinancials, IntegrationStatus } from "./types";

export const SCORE_BASE = 100;

export function calculateHealthScore(
    financials: ProjectFinancials,
    integrations: IntegrationStatus[],
    reconciliationGap: number
): { score: number; level: 'Healthy' | 'Attention' | 'Critical'; breakdown: string[] } {
    let score = SCORE_BASE;
    const breakdown: string[] = [];

    // 1. Overdue Rate Penalty (Max 60 points)
    // Rate 0% -> 0 penalty
    // Rate 10% -> 10 * 6 = 60 penalty
    if (financials.overdue_rate > 0) {
        const penalty = Math.min(60, financials.overdue_rate * 6);
        score -= penalty;
        breakdown.push(`Overdue Rate is ${financials.overdue_rate}% (-${Math.round(penalty)})`);
    } else {
        score += 5; // Bonus for 0% overdue
        breakdown.push("No overdue payments (+5)");
    }

    // 2. Integration Freshness Penalty
    // Any Stale -> -25
    // Any Degraded -> -10
    const hasStale = integrations.some(i => i.status === 'stale');
    const hasDegraded = integrations.some(i => i.status === 'degraded');

    if (hasStale) {
        score -= 25;
        breakdown.push("Data might be stale (-25)");
    } else if (hasDegraded) {
        score -= 10;
        breakdown.push("Data feeds are slow (-10)");
    }

    // 3. Reconciliation Gaps
    // Gap count * 2, max 25
    if (reconciliationGap > 0) {
        const penalty = Math.min(25, reconciliationGap * 2);
        score -= penalty;
        breakdown.push(`Found ${reconciliationGap} reconciliation gaps (-${penalty})`);
    }

    // Final Clamp
    score = Math.max(0, Math.min(100, Math.round(score)));

    let level: 'Healthy' | 'Attention' | 'Critical' = 'Healthy';
    if (score < 50) level = 'Critical';
    else if (score < 80) level = 'Attention';

    return { score, level, breakdown };
}
