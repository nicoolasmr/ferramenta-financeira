
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plug, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// This could come from a shared constant or API
const AVAILABLE_PROVIDERS = [
    { key: "stripe", name: "Stripe", description: "Global payments and subscriptions." },
    { key: "hotmart", name: "Hotmart", description: "Digital products platform." },
    { key: "asaas", name: "Asaas", description: "Brazilian billing and payments." },
    { key: "kiwify", name: "Kiwify", description: "Course platform." },
    { key: "lastlink", name: "Lastlink", description: "Creator economy monetization." },
    { key: "eduzz", name: "Eduzz", description: "Affiliate marketing platform." },
    { key: "monetizze", name: "Monetizze", description: "Digital and physical products." },
    { key: "mercadopago", name: "Mercado Pago", description: "Payment processing." },
    { key: "pagseguro", name: "PagSeguro", description: "Brazilian payments." },
    { key: "belvo", name: "Belvo", description: "Open Finance aggregation." },
];

export default function IntegrationsHubPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [activeProviders, setActiveProviders] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchStatus() {
            // Check which providers have secrets or webhook keys
            const { data } = await supabase.from('project_webhook_keys')
                .select('provider')
                .eq('project_id', projectId)
                .eq('active', true);

            if (data) {
                setActiveProviders(data.map(d => d.provider));
            }
            setLoading(false);
        }
        fetchStatus();
    }, [projectId]);

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-black">Integrations Hub</h1>
                <p className="text-muted-foreground">Connect and manage your financial data sources.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {AVAILABLE_PROVIDERS.map(provider => {
                    const isConnected = activeProviders.includes(provider.key);
                    return (
                        <Card key={provider.key} className={`border-l-4 ${isConnected ? 'border-l-emerald-500' : 'border-l-slate-200'}`}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle>{provider.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{provider.description}</CardDescription>
                                    </div>
                                    {isConnected ? (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Button asChild variant={isConnected ? "outline" : "default"} className="w-full">
                                        <Link href={`/app/projects/${projectId}/integrations/${provider.key}/setup`}>
                                            {isConnected ? "Configure" : "Connect"}
                                        </Link>
                                    </Button>
                                    {isConnected && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href="/ops/webhooks" title="View Webhooks">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>


        </div>
    );
}
