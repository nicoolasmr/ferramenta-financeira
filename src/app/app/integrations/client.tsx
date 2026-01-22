"use client";

import { useState } from "react";
import { Plug, Zap } from "lucide-react";
import { GatewayIntegration } from "@/actions/integrations";
import { PROVIDERS, ProviderSpec } from "@/lib/integrations/providers";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { IntegrationSetupModal } from "@/components/integrations/integration-setup-modal";

interface IntegrationsClientPageProps {
    initialIntegrations: GatewayIntegration[];
    orgId: string;
}

export function IntegrationsClientPage({ initialIntegrations, orgId }: IntegrationsClientPageProps) {
    const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter out providers that might not be ready or active if needed, or just show all
    const providersList = Object.values(PROVIDERS);

    // Helper to find integration for a provider
    const getIntegration = (providerId: string) =>
        initialIntegrations.find(i => i.provider === providerId);

    const handleConfigure = (providerId: string) => {
        setSelectedProviderId(providerId);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Integrações</h1>
                <p className="text-muted-foreground">
                    Gerencie suas conexões com gateways de pagamento e plataformas externas.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {providersList.map((provider) => (
                    <IntegrationCard
                        key={provider.id}
                        provider={provider}
                        integration={getIntegration(provider.id)}
                        orgId={orgId}
                        onConfigure={() => handleConfigure(provider.id)}
                    />
                ))}
            </div>

            {selectedProviderId && (
                <IntegrationSetupModal
                    providerId={selectedProviderId}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    orgId={orgId}
                />
            )}
        </div>
    );
}
