
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function IntegrationsOpsPage() {
    const supabase = await createClient();

    const { data: status } = await supabase
        .from("integration_freshness_view")
        .select("*")
        .order("last_event_at", { ascending: false });

    const { data: runs } = await supabase
        .from("integration_runs")
        .select("*, organizations(name)")
        .order("started_at", { ascending: false })
        .limit(20);

    return (
        <div className="space-y-6 p-8">
            <h1 className="text-3xl font-bold tracking-tight">Integrations Health</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Last Event</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {status?.map((s) => (
                                    <TableRow key={s.provider}>
                                        <TableCell className="capitalize font-medium">{s.provider}</TableCell>
                                        <TableCell>
                                            {s.last_event_at ? formatDistanceToNow(new Date(s.last_event_at), { addSuffix: true, locale: ptBR }) : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                s.health_status === 'healthy' ? 'default' :
                                                    s.health_status === 'stale' ? 'secondary' : 'destructive'
                                            }>
                                                {s.health_status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!status?.length && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                            No active integrations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sync Runs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Run Type</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {runs?.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="capitalize">{r.run_type}</TableCell>
                                        <TableCell className="capitalize">{r.provider}</TableCell>
                                        <TableCell>
                                            <Badge variant={r.status === 'completed' ? 'outline' : 'destructive'}>
                                                {r.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(r.started_at), { addSuffix: true, locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!runs?.length && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                            No recent runs.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
