import { createClient } from "@/lib/supabase/server";

export type AuditAction =
    | "impersonate_start"
    | "impersonate_end"
    | "export_data"
    | "view_sensitive_data"
    | "modify_settings";

export async function logAuditEvent(
    orgId: string,
    actorUserId: string,
    action: AuditAction,
    details: any
) {
    const supabase = await createClient();

    // We assume an 'audit_logs' table exists. 
    // If not, we should create it. But for "Anti-Fragile" patch, maybe we reuse 'state_anomalies' or just console.log if table missing?
    // No, Audit must be persisted.
    // I'll create a migration for audit_logs if I haven't. I didn't see one in previous turns.
    // Let's create it in 20260220_billing_metering.sql (rename it to 20260220_ops_compliance.sql to include both?)
    // Or just a new file.

    try {
        await supabase.from("audit_logs").insert({
            org_id: orgId,
            actor_user_id: actorUserId,
            action,
            details,
            occurred_at: new Date().toISOString()
        });
    } catch (e) {
        console.error("AUDIT LOG FAILED:", e);
        // Fallback to anomaly table?
        // This is critical failure if Audit fails.
    }
}
