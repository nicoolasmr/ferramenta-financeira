import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from "@/lib/integrations/manager";
import { AlertCircle, Plus, CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";

export default async function IntegrationsPage() {
    const supabase = await createClient();

    // 1. Get Current User & Org
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div>Please log in.</div>;

    // Assuming single-tenant or picking the first org for now (MVP context)
    // In a real multi-tenant app, this would come from a context or route param.
    const { data: membership } = await supabase.from("memberships")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

    if (!membership) return <div>No organization found.</div>;

    // 2. Get Freshness Status
    const { data: statuses } = await supabase.from("integration_freshness_view")
        .select("*")
        .eq("org_id", membership.org_id);

    // Helper to get status for a provider
    const getStatus = (providerId: string) => {
        return statuses?.find(s => s.provider === providerId) || null;
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">Manage your external connections and monitor their health.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PROVIDERS.map(p => {
                    const statusData = getStatus(p.id);
                    const isConnected = !!statusData && statusData.status !== 'inactive';

                    return (
                        <Card key={p.id} className={isConnected ? "border-green-200 bg-green-50/10" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-2">
                                        {p.name}
                                    </CardTitle>
                                    {statusData && (
                                        <Badge variant={
                                            statusData.status === 'healthy' ? 'default' :
                                                statusData.status === 'degraded' ? 'secondary' : 'destructive'
                                        }>
                                            {statusData.status}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Connect to {p.name}.
                                    {statusData?.last_event_at && (
                                        <span className="block text-xs mt-1 text-muted-foreground">
                                            Last sync: {new Date(statusData.last_raw_at).toLocaleString()}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {isConnected ? (
                                        <div className="flex items-center text-sm text-green-700 font-medium">
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Connected
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">Not Configured</span>
                                    )}

                                    <Button variant={isConnected ? "outline" : "default"} size="sm">
                                        {isConnected ? <Settings2 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                        {isConnected ? "Configure" : "Setup"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-sm text-blue-800 mt-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                    <p className="font-semibold mb-1">Webhook Configuration</p>
                    <p>
                        Configuring an integration will generate a unique Webhook URL
                        that you must add to the provider's settings to receive events (Sales, Refunds, Chargebacks).
                    </p>
                </div>
            </div>
        </div>
    );
}

// Mock icon for compilation safety if Settings2 is missing, but lucide-react usually has it.
import { Settings2 } from "lucide-react";
