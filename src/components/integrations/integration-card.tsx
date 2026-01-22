"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ProviderSpec } from "@/lib/integrations/providers";
import { GatewayIntegration, toggleIntegration } from "@/actions/integrations";
import { Switch } from "@/components/ui/switch";
import { ConnectionStatus } from "./connection-status";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
    provider: ProviderSpec;
    integration?: GatewayIntegration;
    orgId: string; // Passed for context if needed
    onConfigure: () => void;
}

export function IntegrationCard({ provider, integration, orgId, onConfigure }: IntegrationCardProps) {
    const isConnected = !!integration;
    const isActive = integration?.is_active ?? false;
    const [toggling, setToggling] = useState(false);

    const handleToggle = async (checked: boolean) => {
        if (!integration) return;
        setToggling(true);
        try {
            await toggleIntegration(integration.id, checked);
            toast.success(checked ? "Integração ativada" : "Integração desativada");
        } catch (error) {
            toast.error("Erro ao alterar status da integração");
        } finally {
            setToggling(false);
        }
    };

    return (
        <Card className={cn("flex flex-col h-full transition-all hover:border-primary/20", isConnected && "border-green-600/20 bg-green-50/5")}>
            <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
                <div className="w-12 h-12 relative bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border">
                    {/* Replace with actual Image if available, fallback to text/icon */}
                    <img
                        src={provider.logo}
                        alt={provider.name}
                        className="max-w-[85%] max-h-[85%] object-contain"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold truncate pr-2">
                            {provider.name}
                        </CardTitle>
                        {isConnected ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1 px-2 h-6">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">Ativo</span>
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 gap-1 px-2 h-6">
                                <span className="text-[10px] font-medium uppercase tracking-wider">Inativo</span>
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1 h-9">
                        {provider.description}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pt-2">
                {/* Metadata or stats could go here */}
                {isConnected && integration.last_sync_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Sincronizado {new Date(integration.last_sync_at).toLocaleDateString()}
                    </p>
                )}
            </CardContent>
            <CardFooter className="pt-2 flex flex-col gap-2 border-t bg-slate-50/50">
                {isConnected && (
                    <div className="w-full">
                        <ConnectionStatus status={isActive ? 'connected' : 'disconnected'} />
                    </div>
                )}
                <div className="w-full flex items-center justify-between gap-2">
                    {isConnected ? (
                        <>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={handleToggle}
                                    disabled={toggling}
                                    className="scale-75 origin-left"
                                />
                                <span className="text-xs text-muted-foreground font-medium">
                                    {isActive ? 'On' : 'Off'}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={onConfigure} className="h-8 text-xs">
                                    Configurar
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Button variant="default" size="sm" onClick={onConfigure} className="w-full h-8 text-xs">
                            Conectar
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
