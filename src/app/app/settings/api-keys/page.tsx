"use client";

import { Key, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/EmptyState";

const apiKeys = [
    {
        id: 1,
        name: "Production API Key",
        key: "sk_live_abc123...",
        created: "2024-01-15",
        lastUsed: "2024-01-22 08:00:00",
        status: "active",
    },
    {
        id: 2,
        name: "Development API Key",
        key: "sk_test_xyz789...",
        created: "2024-01-10",
        lastUsed: "2024-01-20 15:30:00",
        status: "active",
    },
];

export default function APIKeysPage() {
    const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                    <p className="text-slate-500">Manage your API authentication keys</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                </Button>
            </div>

            {apiKeys.length === 0 ? (
                <EmptyState
                    title="No API keys"
                    description="Create your first API key to start using the API"
                    icon={<Key className="w-6 h-6 text-slate-400" />}
                    action={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create API Key
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                        <Card key={apiKey.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                                        <CardDescription>Created on {apiKey.created}</CardDescription>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 bg-slate-100 rounded font-mono text-sm">
                                        {showKeys[apiKey.id] ? apiKey.key : "••••••••••••••••"}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            setShowKeys((prev) => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))
                                        }
                                    >
                                        {showKeys[apiKey.id] ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <span className="text-slate-500">Last used: </span>
                                        <span className="font-medium">{apiKey.lastUsed}</span>
                                    </div>
                                    <Button variant="destructive" size="sm">
                                        Revoke
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
