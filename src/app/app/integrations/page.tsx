"use client";

import { Plug, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INTEGRATIONS = [
    {
        id: "stripe",
        name: "Stripe",
        description: "Accept payments and manage subscriptions",
        status: "connected",
        logo: "💳",
    },
    {
        id: "hotmart",
        name: "Hotmart",
        description: "Digital products marketplace",
        status: "disconnected",
        logo: "🔥",
    },
    {
        id: "asaas",
        name: "Asaas",
        description: "Brazilian payment gateway",
        status: "disconnected",
        logo: "💰",
    },
    {
        id: "mercadopago",
        name: "Mercado Pago",
        description: "Latin America payment solution",
        status: "disconnected",
        logo: "🛒",
    },
    {
        id: "eduzz",
        name: "Eduzz",
        description: "Digital products platform",
        status: "disconnected",
        logo: "📦",
    },
    {
        id: "kiwify",
        name: "Kiwify",
        description: "Digital sales platform",
        status: "disconnected",
        logo: "🥝",
    },
];

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-slate-500">Connect your payment gateways and platforms</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS.map((integration) => (
                    <Card key={integration.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{integration.logo}</div>
                                    <div>
                                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {integration.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                {integration.status === "connected" ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not connected
                                    </Badge>
                                )}
                                <Button
                                    size="sm"
                                    variant={integration.status === "connected" ? "outline" : "default"}
                                >
                                    {integration.status === "connected" ? "Configure" : "Connect"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
