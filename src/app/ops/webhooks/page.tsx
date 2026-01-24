
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function WebhooksOpsPage() {
    const supabase = await createClient();

    const { data: events } = await supabase
        .from("external_events_raw")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(50);

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhook Inbox</h1>
                    <p className="text-muted-foreground">Raw events received from external providers.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Events (Last 50)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Received</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Idempotency Key</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events?.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDistanceToNow(new Date(e.received_at), { addSuffix: true, locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="capitalize">{e.provider}</TableCell>
                                    <TableCell className="font-mono text-xs">{e.event_type}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            e.status === 'processed' ? 'default' :
                                                e.status === 'failed' ? 'destructive' : 'secondary'
                                        }>
                                            {e.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[150px] truncate" title={e.idempotency_key}>
                                        {e.idempotency_key}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!events?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No events found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
