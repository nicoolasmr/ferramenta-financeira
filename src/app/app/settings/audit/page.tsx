"use client";

import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const auditLogs = [
    {
        id: 1,
        action: "project.created",
        user: "john@example.com",
        details: "Created project 'New SaaS App'",
        timestamp: "2024-01-22 09:15:00",
        severity: "info",
    },
    {
        id: 2,
        action: "user.invited",
        user: "jane@example.com",
        details: "Invited alice@example.com as member",
        timestamp: "2024-01-22 08:45:00",
        severity: "info",
    },
    {
        id: 3,
        action: "integration.connected",
        user: "john@example.com",
        details: "Connected Stripe integration",
        timestamp: "2024-01-21 16:30:00",
        severity: "warning",
    },
    {
        id: 4,
        action: "api_key.created",
        user: "bob@example.com",
        details: "Created API key 'Production Key'",
        timestamp: "2024-01-21 14:20:00",
        severity: "warning",
    },
];

export default function AuditLogsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-slate-500">Track all activities in your organization</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            <div className="space-y-2">
                {auditLogs.map((log) => (
                    <Card key={log.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
                                                {log.action}
                                            </code>
                                            <Badge
                                                variant={log.severity === "warning" ? "secondary" : "outline"}
                                                className="text-xs"
                                            >
                                                {log.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-900 mb-1">{log.details}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>By {log.user}</span>
                                            <span>•</span>
                                            <span>{log.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
