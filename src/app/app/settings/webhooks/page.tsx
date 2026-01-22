"use client";

import { Webhook, Plus, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/EmptyState";

const webhooks = [
    {
        id: 1,
        url: "https://api.example.com/webhooks/revenue",
        events: ["payment.created", "payment.updated"],
        status: "active",
        lastDelivery: "2024-01-22 08:30:00",
        successRate: 98.5,
    },
];

export default function WebhooksPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                    <p className="text-slate-500">Receive real-time notifications</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                </Button>
            </div>

            {webhooks.length === 0 ? (
                <EmptyState
                    title="No webhooks configured"
                    description="Create your first webhook to receive real-time notifications"
                    icon={<Webhook className="w-6 h-6 text-slate-400" />}
                    action={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Webhook
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {webhooks.map((webhook) => (
                        <Card key={webhook.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-lg">{webhook.url}</CardTitle>
                                            {webhook.status === "active" ? (
                                                <Badge className="bg-green-100 text-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription>
                                            Events: {webhook.events.join(", ")}
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Configure
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Last Delivery</p>
                                        <p className="font-medium">{webhook.lastDelivery}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Success Rate</p>
                                        <p className="font-medium">{webhook.successRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
