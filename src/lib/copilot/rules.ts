
import { Insight, ActionItem, ProjectFinancials, IntegrationStatus, ReceivablesAging } from "./types";

export function evaluateRules(
    orgId: string,
    projectId: string,
    financials: ProjectFinancials,
    integrations: IntegrationStatus[],
    aging: ReceivablesAging,
    reconciliationGap: number
): { insights: Insight[]; actions: ActionItem[] } {
    const insights: Insight[] = [];
    const actions: ActionItem[] = [];

    // Rule 1: High Delinquency
    // If > 8% overdue rate OR > 5k in overdue 60+
    if (financials.overdue_rate > 8 || aging.overdue_60 > 500000) {
        insights.push({
            org_id: orgId,
            project_id: projectId,
            kind: 'project_health',
            severity: 'critical',
            title: 'High Delinquency Risk',
            summary: `Overdue rate is ${financials.overdue_rate}%, with substantial older debt.`,
            evidence_json: { rate: financials.overdue_rate, old_debt: aging.overdue_60 }
        });

        actions.push({
            org_id: orgId,
            project_id: projectId,
            action_type: 'collect_whatsapp',
            priority: 90,
            status: 'open',
            payload_json: { reason: 'high_delinquency', target: 'overdue_60' }
        });
    }

    // Rule 2: Integration Health
    const staleIntegrations = integrations.filter(i => i.status === 'stale');
    if (staleIntegrations.length > 0) {
        insights.push({
            org_id: orgId,
            project_id: projectId,
            kind: 'freshness',
            severity: 'warning',
            title: 'Stale Data Feeds',
            summary: `Integrations (${staleIntegrations.map(i => i.provider).join(', ')}) have not synced in > 24h.`,
            evidence_json: { stale: staleIntegrations.map(i => i.provider) }
        });

        actions.push({
            org_id: orgId,
            project_id: projectId,
            action_type: 'run_sync',
            priority: 80,
            status: 'open',
            payload_json: { providers: staleIntegrations.map(i => i.provider) }
        });
    }

    // Rule 3: Reconciliation Gaps
    if (reconciliationGap > 100) { // Tolerance of 1.00 BRL
        insights.push({
            org_id: orgId,
            project_id: projectId,
            kind: 'reconciliation',
            severity: 'warning',
            title: 'Revenue Gap Detected',
            summary: `There is a difference of ${(reconciliationGap / 100).toFixed(2)} between expected and received revenue.`,
            evidence_json: { gap_cents: reconciliationGap }
        });

        actions.push({
            org_id: orgId,
            project_id: projectId,
            action_type: 'open_reconciliation',
            priority: 70,
            status: 'open',
            payload_json: { gap_cents: reconciliationGap }
        });
    }

    return { insights, actions };
}
