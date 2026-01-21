
import { createClient } from "@/lib/supabase/client";

export type ProjectFinancials = {
    org_id: string;
    project_id: string;
    project_name: string;
    total_sold: number;
    total_received: number;
    total_open: number;
    total_overdue: number;
    overdue_rate: number;
    next_30d_expected: number;
};

export type ReceivablesAging = {
    overdue_30: number;
    overdue_60: number;
    overdue_90_plus: number;
};

export type IntegrationStatus = {
    provider: string;
    last_event_at: string | null;
    status: 'healthy' | 'degraded' | 'stale';
};

export type InsightKind = 'portfolio_health' | 'project_health' | 'anomaly' | 'collections' | 'reconciliation' | 'freshness';
export type Severity = 'info' | 'warning' | 'critical';

export interface Insight {
    id?: string;
    org_id: string;
    project_id?: string | null;
    kind: InsightKind;
    severity: Severity;
    title: string;
    summary: string;
    evidence_json?: any;
    actions_json?: any;
    created_at?: string;
}

export interface ActionItem {
    id?: string;
    org_id: string;
    project_id?: string | null;
    action_type: 'collect_whatsapp' | 'collect_email' | 'run_sync' | 'open_reconciliation' | 'renegotiate' | 'review_mapping';
    priority: number;
    status: 'open' | 'dismissed' | 'done';
    payload_json?: any;
    link?: string; // Virtual property for UI
}
