
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SLOStatus } from "@/components/ops/SLOStatus";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function OpsOverviewPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchMetrics = async () => {
        setLoading(true);

        // Parallel Fetch
        const [qHealth, jobSuccess, anomalies] = await Promise.all([
            supabase.from('ops_queue_health_view').select('*').single(),
            supabase.from('ops_job_success_view').select('*'),
            supabase.from('ops_anomalies_view').select('*').single()
        ]);

        const queue = qHealth.data || { backlog_count: 0, dead_letter_count: 0, oldest_age_seconds: 0 };
        const jobs = jobSuccess.data || [];
        const anomalyStats = anomalies.data || { open_anomalies: 0, critical_anomalies: 0 };

        // Aggregate Job Success (Weighted Average simplified)
        let total = 0, success = 0;
        jobs.forEach((j: any) => { total += j.total; success += j.success; });
        const overallRate = total === 0 ? 100 : (success / total) * 100;

        setMetrics({
            queue,
            overallRate,
            anomalies: anomalyStats
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (loading) return <div className="p-8">Loading Ops Metrics...</div>;

    const { queue, overallRate, anomalies } = metrics;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">System Status (SLOs)</h1>
                    <p className="text-muted-foreground">Real-time platform health verification.</p>
                </div>
                <Button variant="outline" onClick={fetchMetrics}><RefreshCcw className="mr-2 h-4 w-4" /> Refresh</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* SLO 1: Reliability */}
                <SLOStatus
                    title="Job Success Rate (24h)"
                    currentValue={`${overallRate.toFixed(2)}%`}
                    target="> 99.0%"
                    status={overallRate >= 99 ? 'healthy' : overallRate >= 95 ? 'warning' : 'critical'}
                    description="Percentage of background jobs completed successfully."
                />

                {/* SLO 2: Latency / Backlog */}
                <SLOStatus
                    title="Queue Latency (Lag)"
                    currentValue={`${Math.round(queue.oldest_age_seconds)}s`}
                    target="< 300s"
                    status={queue.oldest_age_seconds < 60 ? 'healthy' : queue.oldest_age_seconds < 300 ? 'warning' : 'critical'}
                    description="Age of the oldest pending job in the queue."
                />

                {/* SLO 3: Data Integrity */}
                <SLOStatus
                    title="Critical Anomalies"
                    currentValue={anomalies.critical_anomalies}
                    target="0"
                    status={anomalies.critical_anomalies === 0 ? 'healthy' : 'critical'}
                    description="Financial inconsistencies requiring immediate intervention."
                />
            </div>

            {/* Secondary Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold mb-4">Queue Depth</h3>
                    <div className="flex justify-between items-center border-b py-2">
                        <span>Backlog</span>
                        <span className="font-mono font-bold">{queue.backlog_count}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-red-600">
                        <span>Dead Letters</span>
                        <span className="font-mono font-bold">{queue.dead_letter_count}</span>
                    </div>
                </div>

                <div className="p-6 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold mb-4">Integrity Check</h3>
                    <div className="flex justify-between items-center border-b py-2">
                        <span>Total Open</span>
                        <span className="font-mono font-bold">{anomalies.open_anomalies}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-blue-600">
                        <a href="/ops/consistency" className="text-sm underline">View Consistency Dashboard &rarr;</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
