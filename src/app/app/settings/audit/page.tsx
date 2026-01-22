"use client";

import { useEffect, useState } from "react";
import { Clock, User, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingState } from "@/components/states/LoadingState";
import { getAuditLogs, exportAuditLogs, type AuditLog } from "@/actions/audit";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuditLogs("org-1") // Real org ID should be fetched from context
            .then(setLogs)
            .catch(() => toast.error("Failed to load audit logs"))
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        try {
            const csv = await exportAuditLogs("org-1");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            toast.success("Audit logs exported!");
        } catch (error) {
            toast.error("Failed to export logs");
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-slate-500">Track all activities across your organization</p>
                </div>
                <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {logs.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                No audit logs available.
                            </div>
                        ) : logs.map((log) => (
                            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-slate-900">
                                            {log.action} <span className="text-slate-500 font-normal">on</span> {log.resource}
                                        </p>
                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                            {log.id.substring(0, 8)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {log.actor_id}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    {log.details && (
                                        <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono text-slate-600 overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
