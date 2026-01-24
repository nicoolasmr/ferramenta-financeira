
import { createClient } from "@/lib/supabase/server";

export interface AnomalyDetector {
    name: string;
    run(supabase: any): Promise<void>;
}

export async function logAnomaly(supabase: any, anomaly: {
    org_id: string;
    project_id?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    anomaly_type: string;
    entity_type: string;
    entity_id?: string;
    description: string;
    details?: any;
}) {
    // Idempotent insert based on open status?
    // We want to avoid spamming duplicate open anomalies.

    // Check if open anomaly exists
    const { data: existing } = await supabase.from('state_anomalies')
        .select('id')
        .eq('org_id', anomaly.org_id)
        .eq('anomaly_type', anomaly.anomaly_type)
        .eq('entity_id', anomaly.entity_id)
        .eq('status', 'open')
        .single();

    if (existing) return; // Already flagged

    await supabase.from('state_anomalies').insert({
        ...anomaly,
        status: 'open',
        detected_at: new Date().toISOString()
    });
}
