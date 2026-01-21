
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";
import { ReplayButton } from "./replay-button";
import { SyncButton } from "./sync-button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function WebhooksPage({ searchParams }: { searchParams: { q?: string } }) {
    const supabase = await createClient();
    const query = searchParams?.q || "";

    // Build Query
    let dbQuery = supabase.from("external_events_raw")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(100);

    if (query) {
        dbQuery = dbQuery.or(`external_event_id.ilike.%${query}%,provider.ilike.%${query}%`);
    }

    const { data: webhooks } = await dbQuery;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhooks Inspector</h1>
                    <p className="text-muted-foreground">View and replay raw events from external providers.</p>
                </div>
                <div className="flex gap-2">
                    <SyncButton />
                    <Button variant="outline" size="sm" asChild>
                        <a href="/ops/webhooks">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </a>
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 items-center bg-white p-4 rounded-lg border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <form className="flex-1">
                    <Input
                        name="q"
                        placeholder="Filter by ID or Provider..."
                        defaultValue={query}
                        className="bg-transparent border-none shadow-none focus-visible:ring-0"
                    />
                </form>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">ID</TableHead>
                            <TableHead className="w-[100px]">Provider</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="text-right w-[180px]">Received At</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!webhooks || webhooks.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No webhooks found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            webhooks.map((hook) => (
                                <TableRow key={hook.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground" title={hook.external_event_id}>
                                        {hook.external_event_id.length > 20 ? hook.external_event_id.substring(0, 20) + '...' : hook.external_event_id}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{hook.provider}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-medium">
                                        {hook.event_type}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={hook.status === 'processed' ? 'default' : (hook.status === 'ignored' ? 'secondary' : 'destructive')}>
                                            {hook.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {new Date(hook.received_at).toLocaleString('pt-BR')}
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
            <div className="text-xs text-muted-foreground text-center">
                Showing last {webhooks?.length || 0} events.
            </div>
        </div>
    );
}
