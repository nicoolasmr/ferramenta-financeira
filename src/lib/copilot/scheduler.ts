
import { createClient } from "@/lib/supabase/server";
import { calculateHealthScore } from "./scoring";
import { evaluateRules } from "./rules";
import { ProjectFinancials, IntegrationStatus, ReceivablesAging } from "./types";

export async function runCopilotForOrg(orgId: string) {
    const supabase = await createClient();

    // 1. Fetch Data
    const { data: projects } = await supabase.from('project_financials_view').select('*').eq('org_id', orgId);
    const { data: integrations } = await supabase.from('integration_freshness_view').select('*').eq('org_id', orgId);

    // Cleanup old insights to avoid duplicates/stale data (optional strategy: soft delete or replace)
    // Ideally we keep history, but for MVP let's assume we want "Current State" on dashboard
    // or we just append rows and UI filters by 'created_at desc limit 1'.
    // Let's rely on the UNIQUE constraint in the DB and simple "insert if not exists" logic isn't enough for new timestamps.
    // For now, let's just INSERT.

    if (!projects) return;

    for (const project of projects) {
        // Fetch specific data for this project
        const { data: aging } = await supabase.from('receivables_aging_view')
            .select('*')
            .eq('org_id', orgId)
            .eq('project_id', project.project_id)
            .single();

        const { data: recon } = await supabase.from('reconciliation_summary_view')
            .select('*')
            .eq('org_id', orgId)
            .eq('project_id', project.project_id)
            .single();

        const projectIntegrations = integrations?.filter(i => i.org_id === orgId) || []; // Actually integrations are usually org-wide, maybe filtered by provider if project specific? 
        // For now assume integrations are Organization Wide credentials.

        // 2. Calculate Score
        const { score, level, breakdown } = calculateHealthScore(
            project as ProjectFinancials,
            (projectIntegrations as IntegrationStatus[]),
            recon?.delta_count || 0
        );

        // 3. Run Rules
        const { insights, actions } = evaluateRules(
            orgId,
            project.project_id,
            project as ProjectFinancials,
            (projectIntegrations as IntegrationStatus[]),
            aging || { overdue_30: 0, overdue_60: 0, overdue_90_plus: 0 }, // Fallback
            recon?.delta_count || 0
        );

        // 4. Save to DB
        // Save Score? Maybe as an insight "Project Score"
        if (true) { // Always save score insight
            const scoreInsight = {
                org_id: orgId,
                project_id: project.project_id,
                kind: 'project_health',
                severity: level === 'Critical' ? 'critical' : (level === 'Attention' ? 'warning' : 'info'),
                title: `Project Health: ${level} (${score}/100)`,
                summary: `Score is ${score}. Factors: ${breakdown.join(', ')}.`,
                evidence_json: { score, level, breakdown }
            };
            await supabase.from('insights').insert(scoreInsight);
        }

        if (insights.length > 0) await supabase.from('insights').insert(insights);
        if (actions.length > 0) await supabase.from('actions_queue').insert(actions);
    }
}
