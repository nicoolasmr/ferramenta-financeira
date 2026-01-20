"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const logs = [
    { id: "log_1", actor: "Nicolas Moreira", action: "refund_created", resource: "order:ord_3", time: "2023-01-20 10:55 AM" },
    { id: "log_2", actor: "Nicolas Moreira", action: "integration_updated", resource: "integration:stripe", time: "2023-01-20 10:00 AM" },
    { id: "log_3", actor: "System", action: "sync_completed", resource: "job:sync_daily", time: "2023-01-20 02:00 AM" },
    { id: "log_4", actor: "Support Team", action: "customer_updated", resource: "customer:cus_5", time: "2023-01-19 05:30 PM" },
];

export default function AuditLogsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-[10px]">{log.actor.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{log.actor}</span>
                                </TableCell>
                                <TableCell>
                                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{log.action}</code>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{log.resource}</TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">{log.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
