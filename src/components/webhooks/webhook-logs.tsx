"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { RefreshCw, RotateCcw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getWebhookLogs, retryWebhookEvent, type WebhookEvent } from "@/actions/webhooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WebhookLogs({ orgId }: { orgId: string }) {
    const [logs, setLogs] = useState<WebhookEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getWebhookLogs(orgId);
            setLogs(data);
        } catch (error) {
            toast.error("Failed to load webhook logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [orgId]);

    const handleRetry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRetrying(id);
        try {
            await retryWebhookEvent(id);
            toast.success("Event queued for retry");
            fetchLogs(); // Refresh to see status change
        } catch (error) {
            toast.error("Failed to retry event");
        } finally {
            setRetrying(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "processed":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Processed</Badge>;
            case "failed":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            default:
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Event History</h3>
                <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Received At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No events found
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <Dialog key={log.id}>
                                    <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer hover:bg-slate-50">
                                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                                            <TableCell className="font-medium">{log.provider}</TableCell>
                                            <TableCell>{format(new Date(log.received_at), "PPpp")}</TableCell>
                                            <TableCell>
                                                {log.status === 'failed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => handleRetry(log.id, e)}
                                                        disabled={retrying === log.id}
                                                    >
                                                        <RotateCcw className={cn("w-4 h-4 mr-1", retrying === log.id && "animate-spin")} />
                                                        Retry
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Webhook Event Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-semibold block text-slate-500">Provider</span>
                                                    {log.provider}
                                                </div>
                                                <div>
                                                    <span className="font-semibold block text-slate-500">Received At</span>
                                                    {format(new Date(log.received_at), "PPpp")}
                                                </div>
                                                <div>
                                                    <span className="font-semibold block text-slate-500">Status</span>
                                                    {log.status}
                                                </div>
                                                {log.error_message && (
                                                    <div className="col-span-2 p-3 bg-red-50 text-red-900 rounded-md border border-red-200">
                                                        <span className="font-semibold block mb-1">Error</span>
                                                        {log.error_message}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <span className="font-semibold block text-slate-500 mb-2">Payload</span>
                                                <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-slate-50 font-mono text-xs">
                                                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
