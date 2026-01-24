
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type IntegrationStatus = {
    provider: string;
    project_id: string;
    last_event_at: string | null;
    status: 'healthy' | 'degraded' | 'stale';
    backlog: number;
};

export default function IntegrationsOpsPage() {
    const [statuses, setStatuses] = useState<IntegrationStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function load() {
            // In a real scenario, this would be a SQL View `integration_freshness_view`
            // For now, we simulate by aggregating `jobs_queue` on client/server or fetching from view if created.
            // Let's assume we fetch from the view created in Phase 3 of previous pack, or we query raw.

            // Querying jobs_queue for last event per provider
            const { data: jobs } = await supabase
                .from('jobs_queue')
                .select('payload, created_at, status')
                .eq('job_type', 'apply_event')
                .order('created_at', { ascending: false })
                .limit(100);

            const map = new Map<string, IntegrationStatus>();

            jobs?.forEach(job => {
                const provider = job.payload?.provider || 'unknown';
                const current = map.get(provider) || {
                    provider,
                    project_id: job.project_id,
                    last_event_at: null,
                    status: 'stale',
                    backlog: 0
                };

                if (!current.last_event_at) current.last_event_at = job.created_at;
                if (job.status === 'queued') current.backlog++;

                map.set(provider, current);
            });

            // Determine health
            const now = new Date();
            const result = Array.from(map.values()).map(s => {
                if (!s.last_event_at) return s;
                const diff = now.getTime() - new Date(s.last_event_at).getTime();
                if (diff < 1000 * 60 * 60) s.status = 'healthy'; // < 1h
                else if (diff < 1000 * 60 * 60 * 24) s.status = 'degraded'; // < 24h
                else s.status = 'stale';
                return s;
            });

            setStatuses(result);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">Integrations Health</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statuses.map(s => (
                    <Card key={s.provider} className="border-l-4" style={{
                        borderLeftColor: s.status === 'healthy' ? '#10b981' : s.status === 'degraded' ? '#f59e0b' : '#ef4444'
                    }}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <CardTitle className="capitalize">{s.provider}</CardTitle>
                                {s.status === 'healthy' ? <CheckCircle className="text-emerald-500" /> : <AlertTriangle className="text-yellow-500" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Last Event:</span>
                                    <span className="font-mono text-foreground">{s.last_event_at ? formatDistanceToNow(new Date(s.last_event_at), { addSuffix: true }) : 'Never'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Backlog:</span>
                                    <span className="font-mono text-foreground">{s.backlog} jobs</span>
                                </div>
                                <div className="mt-4">
                                    <Badge variant={s.status === 'healthy' ? 'secondary' : 'destructive'} className="uppercase">
                                        {s.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {!loading && statuses.length === 0 && <p>No events found.</p>}
            </div>
        </div>
    );
}
