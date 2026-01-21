import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIntegrationLogs, saveIntegrationConfig } from "../actions";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type IntegrationLog = {
    id: string;
    status: string;
    event_type: string;
    external_event_id: string;
    received_at: string;
};

export default async function IntegrationProviderPage({ params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;
    const logs = (await getIntegrationLogs(provider)) as IntegrationLog[];

    // Get current config status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let isConnected = false;

    if (user) {
        const { data: membership } = await supabase.from("memberships").select("org_id").eq("user_id", user.id).single();
        if (membership) {
            const { data: integration } = await supabase.from("integrations")
                .select("status")
                .eq("org_id", membership.org_id)
                .eq("provider", provider)
                .single();
            isConnected = integration?.status === 'active';
        }
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/${provider}`;

    return (
        <div className="container py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight capitalize">{provider} Integration</h1>
                    <p className="text-muted-foreground">Configure payments and events from {provider}.</p>
                </div>
                {isConnected ? (
                    <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-4 h-4 mr-2" /> Active</Badge>
                ) : (
                    <Badge variant="secondary">Not Connected</Badge>
                )}
            </div>

            <Tabs defaultValue="setup">
                <TabsList>
                    <TabsTrigger value="setup">Setup Guide</TabsTrigger>
                    <TabsTrigger value="logs">Webhook Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="setup" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Configure Webhook</CardTitle>
                            <CardDescription>Copy this URL to your {provider} settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input value={webhookUrl} readOnly className="font-mono bg-muted" />
                                <Button variant="outline">Copy</Button>
                            </div>
                            <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-md border border-blue-100">
                                <strong>Events to listen:</strong>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {provider === 'stripe' && <li>checkout.session.completed, customer.subscription.*</li>}
                                    {provider === 'hotmart' && <li>PURCHASE_COMPLETE, PURCHASE_CANCELED</li>}
                                    {provider === 'asaas' && <li>PAYMENT_RECEIVED, PAYMENT_OVERDUE</li>}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. API Credentials</CardTitle>
                            <CardDescription>Enter your credentials to enable features.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={saveIntegrationConfig.bind(null, provider)} className="space-y-4">
                                {provider === 'stripe' && (
                                    <div className="space-y-2">
                                        <Label>Stripe Account ID (Optional for Connect)</Label>
                                        <Input name="account_id" placeholder="acct_..." />
                                    </div>
                                )}
                                {provider === 'hotmart' && (
                                    <div className="space-y-2">
                                        <Label>Hotmart Token (Hottok)</Label>
                                        <Input name="hottok" type="password" />
                                    </div>
                                )}
                                {provider === 'asaas' && (
                                    <div className="space-y-2">
                                        <Label>API Key</Label>
                                        <Input name="api_key" type="password" />
                                    </div>
                                )}
                                <Button type="submit">Save Configuration</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Recent Events
                                <Button variant="ghost" size="sm"><RefreshCcw className="w-4 h-4" /></Button>
                            </CardTitle>
                            <CardDescription>Real-time log of incoming webhooks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No events received yet.</div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={log.status === 'processed' ? 'outline' : 'destructive'}>
                                                    {log.status}
                                                </Badge>
                                                <div>
                                                    <p className="font-medium text-sm">{log.event_type}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{log.external_event_id}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.received_at).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
