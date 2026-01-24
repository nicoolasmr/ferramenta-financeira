
import { AnomalyDetector, logAnomaly } from "../types";

export const PayoutUnmatchedDetector: AnomalyDetector = {
    name: "payout_unmatched",
    async run(supabase) {
        // Condition: Payout (Gateway) exists, is paid, occurred > 3 days ago, 
        // but NO matching Bank Credit in `reconciliation_summary_view` (derived logic) or direct link.

        // Simplistic check for MVP:
        // Find payouts paid > 3 business days ago
        // Check if `ledger_entries` has a 'bank_credit' that covers it? 
        // Or simpler: Check if we have a Bank Transaction linked via external_refs (if we had exact linking).

        // Let's use the Reconciliation View logic: 
        // If Gateway Payouts > 0 AND Bank Received = 0 for the Project/Provider pair.

        const { data: mismatches, error } = await supabase
            .from('reconciliation_summary_view')
            .select('*')
            .gt('gateway_payouts', 0)
            .eq('bank_received_total', 0); // No bank match

        if (error) return;

        for (const item of mismatches) {
            await logAnomaly(supabase, {
                org_id: item.org_id,
                project_id: item.project_id,
                severity: 'high',
                anomaly_type: 'payout_unmatched',
                entity_type: 'project', // It's an aggregate anomaly
                entity_id: item.project_id,
                description: `Gateway payouts of ${(item.gateway_payouts / 100).toFixed(2)} found for ${item.provider}, but no Bank Credit detected.`,
                details: { provider: item.provider, expected: item.gateway_payouts }
            });
        }
    }
};
