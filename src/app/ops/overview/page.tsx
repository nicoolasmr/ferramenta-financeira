
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Webhook, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function OpsOverviewPage() {
    const supabase = await createClient();

    // 1. Fetch Freshness (Real Health Check)
    const { data: freshness } = await supabase.from("integration_freshness_view").select("*");

    // 2. Fetch Webhook Stats (Last 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Note: This is an expensive query in production, usually we'd use a materialized view or stats table
    // For MVP, counting rows with limit is safer or just trusting the "freshness" view
    const { count: webhooks24h } = await supabase
        .from("external_events_raw")
        .select("*", { count: 'exact', head: true })
        .gte("received_at", yesterday.toISOString());

    // 3. Fetch Anomalies
    const { count: anomalyCount } = await supabase
        .from("state_anomalies")
        .select("*", { count: 'exact', head: true })
        .is("resolved_at", null);

    const isHealthy = (freshness?.every(f => f.status === 'healthy') ?? true) && (anomalyCount === 0);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Operations Overview</h1>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className={`h-4 w-4 ${isHealthy ? "text-green-500" : "text-amber-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isHealthy ? "text-green-600" : "text-amber-600"}`}>
                            {isHealthy ? "Healthy" : "Attention"}
                        </div>
                        <p className="text-xs text-muted-foreground">Global health check</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Webhooks (24h)</CardTitle>
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{webhooks24h?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">Events ingested</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Connectors</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{freshness?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Providers sending data</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
                        <ShieldAlert className={`h-4 w-4 ${anomalyCount ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${anomalyCount ? "text-red-600" : ""}`}>{anomalyCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Unresolved issues</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Integration Freshness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {freshness?.map((f) => (
                                <div key={`${f.org_id}-${f.provider}`} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {f.status === 'healthy' ? (
                                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        ) : f.status === 'degraded' ? (
                                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                        ) : (
                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                        )}
                                        <span className="font-medium capitalize">{f.provider}</span>
                                        <span className="text-xs text-muted-foreground font-mono">({f.freshness_seconds ? `${Math.round(f.freshness_seconds / 60)}m ago` : 'Never'})</span>
                                    </div>
                                    <Badge variant={f.status === 'healthy' ? 'outline' : 'destructive'}>
                                        {f.status}
                                    </Badge>
                                </div>
                            ))}
                            {(!freshness || freshness.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No integration data found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Anomaly Detector</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {anomalyCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="font-semibold">All Clear</h3>
                                <p className="text-sm text-muted-foreground">No data integrity issues detected.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                                <h3 className="font-semibold text-red-600">{anomalyCount} Issues Detected</h3>
                                <p className="text-sm text-muted-foreground">Check the Anomalies tab for details.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
