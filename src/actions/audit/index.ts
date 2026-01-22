"use server";

import { createClient } from "@/lib/supabase/server";

export interface AuditLog {
    id: string;
    org_id: string;
    actor_id: string;
    action: string;
    resource: string;
    entity?: string;
    details: any;
    created_at: string;
}

export async function getAuditLogs(orgId: string): Promise<AuditLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching audit logs:", error);
        return [];
    }

    return data || [];
}

export async function exportAuditLogs(orgId: string): Promise<string> {
    const logs = await getAuditLogs(orgId);

    if (logs.length === 0) return "No logs found";

    const headers = ["ID", "Date", "Actor ID", "Action", "Resource", "Entity", "Details"];
    const rows = logs.map((log) => [
        log.id,
        new Date(log.created_at).toISOString(),
        log.actor_id,
        log.action,
        log.resource,
        log.entity || "",
        JSON.stringify(log.details).replace(/"/g, '""'),
    ]);

    const csv = [
        headers.join(","),
        ...rows.map((row) => `"${row.join('","')}"`),
    ].join("\n");

    return csv;
}
