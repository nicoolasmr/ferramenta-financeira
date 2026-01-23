import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function BelvoOpsPage() {
    const supabase = await createClient();

    // 1. Fetch Integration Events
    const { data: events } = await supabase
        .from("integration_events")
        .select("*")
        .eq("provider", "belvo")
        .order("received_at", { ascending: false })
        .limit(20);

    // 2. Fetch Connections Status
    const { data: connections } = await supabase
        .from("bank_connections")
        .select("*, organizations(name)")
        .order("updated_at", { ascending: false });

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Belvo Integration Ops</h1>
                <Badge variant="outline" className="text-sm">
                    {connections?.length || 0} Connections
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Connection Health */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Institution</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Sync</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connections?.map((conn: any) => (
                                    <TableRow key={conn.id}>
                                        <TableCell className="font-medium">{conn.organizations?.name || conn.org_id}</TableCell>
                                        <TableCell>{conn.institution}</TableCell>
                                        <TableCell>
                                            <Badge variant={conn.status === 'connected' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                                {conn.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(conn.updated_at), { addSuffix: true, locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!connections?.length && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No connections found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Webhook Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Webhook Events (Last 20)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events?.map((event) => (
                                <div key={event.id} className="flex flex-col gap-1 border-b pb-3 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {event.event_type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(event.received_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                                            Link: {event.payload?.link_id || event.payload?.link || 'N/A'}
                                        </span>
                                        <Badge variant={event.status === 'processed' ? 'secondary' : 'outline'} className="text-[10px]">
                                            {event.status}
                                        </Badge>
                                    </div>
                                    {event.error_message && (
                                        <p className="text-xs text-red-500 mt-1">{event.error_message}</p>
                                    )}
                                </div>
                            ))}
                            {!events?.length && (
                                <p className="text-center text-muted-foreground p-4">No events recorded</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
