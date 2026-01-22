"use client";

import { useEffect, useState } from "react";
import { Plug, CheckCircle, XCircle, Settings2, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getIntegrations,
    connectIntegration,
    disconnectIntegration,
    toggleIntegration,
    type GatewayIntegration,
    type GatewayProvider,
} from "@/actions/integrations";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INTEGRATIONS_CONFIG = [
    {
        id: "stripe",
        name: "Stripe",
        description: "Accept payments and manage subscriptions",
        logo: "💳",
        fields: [
            { name: "apiKey", label: "Secret Key", type: "password", placeholder: "sk_test_..." },
        ],
    },
    {
        id: "hotmart",
        name: "Hotmart",
        description: "Digital products marketplace",
        logo: "🔥",
        fields: [
            { name: "clientId", label: "Client ID", type: "text" },
            { name: "clientSecret", label: "Client Secret", type: "password" },
            { name: "basicAuth", label: "Basic Auth", type: "password" },
        ],
    },
    {
        id: "asaas",
        name: "Asaas",
        description: "Brazilian payment gateway",
        logo: "💰",
        fields: [
            { name: "apiKey", label: "API Key", type: "password" },
        ],
    },
    {
        id: "mercadopago",
        name: "Mercado Pago",
        description: "Latin America payment solution",
        logo: "🛒",
        fields: [
            { name: "accessToken", label: "Access Token", type: "password" },
        ],
    },
    {
        id: "eduzz",
        name: "Eduzz",
        description: "Digital products platform",
        logo: "📦",
        fields: [
            { name: "publicKey", label: "Public Key", type: "text" },
            { name: "apiKey", label: "API Key", type: "password" },
        ],
    },
    {
        id: "kiwify",
        name: "Kiwify",
        description: "Digital sales platform",
        logo: "🥝",
        fields: [
            { name: "secretKey", label: "Secret Key", type: "password" },
        ],
    },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<GatewayIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [configData, setConfigData] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchIntegrations = async () => {
        try {
            const data = await getIntegrations("proj-1"); // Real project ID should be fetched from context
            setIntegrations(data);
        } catch (error) {
            toast.error("Failed to load integrations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const handleConnect = (provider: any) => {
        const existing = integrations.find(i => i.provider === provider.id);
        setSelectedProvider(provider);
        setConfigData(existing?.credentials || {});
        setIsConfigOpen(true);
    };

    const onSave = async () => {
        setIsSaving(true);
        try {
            await connectIntegration({
                projectId: "proj-1", // Real project ID should be fetched from context
                provider: selectedProvider.id,
                credentials: configData,
            });
            toast.success(`${selectedProvider.name} connected successfully`);
            setIsConfigOpen(false);
            fetchIntegrations();
        } catch (error) {
            toast.error("Failed to connect integration");
        } finally {
            setIsSaving(false);
        }
    };

    const onDisconnect = async (id: string) => {
        if (!confirm("Are you sure you want to disconnect this integration?")) return;
        try {
            await disconnectIntegration(id);
            toast.success("Integration disconnected");
            fetchIntegrations();
        } catch (error) {
            toast.error("Failed to disconnect");
        }
    };

    const onToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleIntegration(id, !currentStatus);
            toast.success(`Integration ${!currentStatus ? 'enabled' : 'disabled'}`);
            fetchIntegrations();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-slate-500">Connect your payment gateways and platforms</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS_CONFIG.map((provider) => {
                    const integration = integrations.find((i) => i.provider === provider.id);
                    const isConnected = !!integration;

                    return (
                        <Card key={provider.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{provider.logo}</div>
                                        <div>
                                            <CardTitle className="text-lg">{provider.name}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {provider.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        {isConnected ? (
                                            <Badge className={integration.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-700"}>
                                                {integration.is_active ? (
                                                    <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                                                ) : (
                                                    <><PowerOff className="h-3 w-3 mr-1" /> Disabled</>
                                                )}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Not connected
                                            </Badge>
                                        )}
                                        <div className="flex gap-2">
                                            {isConnected && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onToggle(integration.id, integration.is_active)}
                                                    title={integration.is_active ? "Disable" : "Enable"}
                                                >
                                                    <Power className={`h-4 w-4 ${integration.is_active ? 'text-green-600' : 'text-slate-400'}`} />
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant={isConnected ? "outline" : "default"}
                                                onClick={() => handleConnect(provider)}
                                            >
                                                {isConnected ? "Configure" : "Connect"}
                                            </Button>
                                            {isConnected && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDisconnect(integration.id)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Configure {selectedProvider?.name}</DialogTitle>
                        <DialogDescription>
                            Enter your API credentials to connect {selectedProvider?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {selectedProvider?.fields.map((field: any) => (
                            <div key={field.name} className="grid items-center gap-4">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                <Input
                                    id={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={configData[field.name] || ""}
                                    onChange={(e) => setConfigData({ ...configData, [field.name]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={onSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Configuration"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
