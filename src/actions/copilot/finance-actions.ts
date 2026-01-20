"use server";

import { getReceivablesMetrics } from "@/lib/finance/receivables";
import { runSimulation, SimulationScenario } from "@/lib/finance/simulator";

export async function fetchFinancialMetrics(orgId: string) {
    // Hardcoded orgId handled by caller usually, but for Copilot MVP we pass it or default
    return await getReceivablesMetrics(orgId);
}

export async function processSimulation(orgId: string, scenario: SimulationScenario) {
    return await runSimulation(orgId, undefined, scenario);
}
