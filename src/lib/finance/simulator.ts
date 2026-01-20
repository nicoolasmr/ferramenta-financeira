import { getReceivablesMetrics } from "./receivables";

export type SimulationScenario = {
    monthsHorizon: 30 | 60 | 90;
    defaultRate: number; // e.g., 0.10 for 10%
    delayDaysAvg: number;
};

export async function runSimulation(orgId: string, projectId: string | undefined, scenario: SimulationScenario) {
    const metrics = await getReceivablesMetrics(orgId, projectId);

    // Baseline
    const baseline = metrics.next30; // Simply taking next30 for MVP example

    // Simulated
    // 1. Apply Default Rate (lost revenue)
    const lostRevenue = baseline * scenario.defaultRate;
    const remaining = baseline - lostRevenue;

    // 2. Delay Impact (Push revenue to next bucket? For MVP just show "Delayed")
    // If avg delay is > 15 days, we assume 50% of monthly revenue slips to next month
    const delayedRevenue = scenario.delayDaysAvg > 15 ? remaining * 0.5 : remaining * 0.2;

    const realizesRevenue = remaining - delayedRevenue;

    return {
        baseline,
        simulated: Math.round(realizesRevenue),
        lost: Math.round(lostRevenue),
        delayed: Math.round(delayedRevenue)
    };
}
