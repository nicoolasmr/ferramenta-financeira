
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle, RefreshCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ConsistencyOpsPage() {
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchAnomalies = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('state_anomalies')
            .select('*')
            .order('detected_at', { ascending: false });
        setAnomalies(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchAnomalies();
    }, []);

    const runDetector = async () => {
        await fetch('/api/cron/consistency', { method: 'POST' });
        fetchAnomalies();
    };

    const resolveAnomaly = async (id: string) => {
        await supabase.from('state_anomalies').update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution_notes: 'Manual resolution via Ops'
        }).eq('id', id);
        fetchAnomalies();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Consistency Ops</h1>
                    <p className="text-muted-foreground">Manage data anomalies and detectors.</p>
                </div>
                <Button onClick={runDetector}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Run Detectors
                </Button>
            </div>

            <div className="grid gap-4">
                {anomalies.map((item) => (
                    <Card key={item.id} className="border-l-4" style={{ borderLeftColor: item.severity === 'critical' ? 'red' : item.severity === 'high' ? 'orange' : 'blue' }}>
                        <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-2 items-center">
                                    <ShieldAlert className="h-5 w-5 text-slate-500" />
                                    <span className="font-bold">{item.anomaly_type}</span>
                                    <Badge variant={item.status === 'open' ? 'destructive' : 'outline'}>{item.status}</Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{new Date(item.detected_at).toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="py-2 pb-4">
                            <p className="text-sm mb-4">{item.description}</p>
                            {item.status === 'open' && (
                                <Button size="sm" variant="outline" onClick={() => resolveAnomaly(item.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
