import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play } from "lucide-react";
import { ReplayButton } from "./replay-button";
import { SyncButton } from "./sync-button"; // New component
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export default async function WebhooksPage() {
    const supabase = await createClient();
    const { data: webhooks } = await supabase.from("external_events_raw")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(50);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Webhooks (Ops)</h1>
                <div className="flex gap-2">
                    <SyncButton />
                    <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Received At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!webhooks || webhooks.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No webhooks received yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            webhooks.map((hook) => (
                                <TableRow key={hook.id}>
                                    <TableCell className="font-mono text-xs">{hook.external_event_id.substring(0, 12)}...</TableCell>
                                    <TableCell>{hook.provider}</TableCell>
                                    <TableCell className="font-mono text-xs">{hook.event_type}</TableCell>
                                    <TableCell>
                                        <Badge variant={hook.status === 'processed' ? 'default' : (hook.status === 'ignored' ? 'secondary' : 'destructive')}>
                                            {hook.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {new Date(hook.received_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ReplayButton
                                            orgId={hook.org_id}
                                            provider={hook.provider}
                                            eventId={hook.external_event_id}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

