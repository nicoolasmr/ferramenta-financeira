
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IntegrationSetupCard } from "@/components/integrations/IntegrationSetupCard";
import { getSetupConfigFromAction } from "@/actions/integrations/setup-proxy"; // We need a server action to call SDK
import { Loader2 } from "lucide-react";

export default function GenericIntegrationSetupPage() {
    const params = useParams();
    const projectId = params.id as string;
    const provider = params.provider as string;

    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                // Call Server Action that wraps the SDK
                const cfg = await getSetupConfigFromAction(projectId, provider);
                if (!cfg) throw new Error("Provider not found or not supported.");
                setConfig(cfg);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [projectId, provider]);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-12 text-red-500">Error: {error}</div>;
    if (!config) return null;

    return (
        <IntegrationSetupCard
            provider={provider}
            providerName={config.providerName}
            projectId={projectId}
            webhookUrl={config.webhookUrl}
            credentialFields={config.fields}
            steps={config.instructions}
        />
    );
}
