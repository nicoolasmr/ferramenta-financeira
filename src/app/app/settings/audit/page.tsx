"use client";

import { useEffect, useState } from "react";
import { Clock, User, Shield, Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingState } from "@/components/states/LoadingState";
import { getAuditLogs, exportAuditLogs, type AuditLog } from "@/actions/audit";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AuditLogsPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("all");
    const [resourceFilter, setResourceFilter] = useState("all");

    useEffect(() => {
        if (!activeOrganization) return;

        getAuditLogs(activeOrganization.id)
            .then((data) => {
                setLogs(data);
                setFilteredLogs(data);
            })
            .catch(() => toast.error("Failed to load audit logs"))
            .finally(() => setLoading(false));
    }, [activeOrganization]);

    useEffect(() => {
        let result = logs;

        if (search) {
            result = result.filter(log =>
                log.action.toLowerCase().includes(search.toLowerCase()) ||
                log.resource.toLowerCase().includes(search.toLowerCase()) ||
                log.actor_id.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (actionFilter !== "all") {
            result = result.filter(log => log.action === actionFilter);
        }

        if (resourceFilter !== "all") {
            result = result.filter(log => log.resource === resourceFilter);
        }

        setFilteredLogs(result);
    }, [search, actionFilter, resourceFilter, logs]);

    const handleExport = async () => {
        if (!activeOrganization) return;
        try {
            const csv = await exportAuditLogs(activeOrganization.id);
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

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
    const uniqueResources = Array.from(new Set(logs.map(l => l.resource)));

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

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 uppercase">Search</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-[180px] space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 uppercase">Action</label>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map(action => (
                                    <SelectItem key={action} value={action}>{action}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-[180px] space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 uppercase">Resource</label>
                        <Select value={resourceFilter} onValueChange={setResourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Resources" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Resources</SelectItem>
                                {uniqueResources.map(resource => (
                                    <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="ghost" onClick={() => { setSearch(""); setActionFilter("all"); setResourceFilter("all"); }}>
                        Reset
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredLogs.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                No audit logs match your filters.
                            </div>
                        ) : filteredLogs.map((log) => (
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
