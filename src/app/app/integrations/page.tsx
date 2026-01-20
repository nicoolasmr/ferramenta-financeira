"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROVIDERS } from "@/lib/integrations/manager";
import { AlertCircle, Plus, Settings2 } from "lucide-react";

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">Manage your external connections (Payment Gateways, Checkout).</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PROVIDERS.map(p => (
                    <Card key={p.id}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                {p.name}
                            </CardTitle>
                            <CardDescription>Connect to {p.name} account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground italic">Not Configured</span>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Setup
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-sm text-blue-800 mt-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                    <strong>Webhook Listener:</strong> Configuring an integration will generate a unique Webhook URL
                    that you must add to the provider's settings to receive events (Sales, Refunds, Chargebacks).
                </p>
            </div>
        </div>
    );
}
