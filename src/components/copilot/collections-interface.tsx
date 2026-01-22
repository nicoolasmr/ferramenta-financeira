"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, ListChecks, MessageSquare, AlertTriangle } from "lucide-react";
import { fetchFinancialMetrics } from "@/actions/copilot/finance-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export function CollectionsInterface() {
    const { activeOrganization } = useOrganization();
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization) return;
        fetchFinancialMetrics(activeOrganization.id).then(setMetrics).catch(() => toast.error("Failed to load metrics")).finally(() => setLoading(false));
    }, [activeOrganization]);

    const templates = {
        "1-30": "Olá! Notamos que o pagamento da sua parcela está em aberto (até 30 dias). Houve algum imprevisto? Podemos ajudar?",
        "31-60": "Olá. Sua parcela já consta com mais de 30 dias de atraso. Para evitar bloqueios, por favor regularize o quanto antes ou nos chame para renegociar.",
        "60+": "URGENTE: Consta pendência superior a 60 dias. Seu contrato está sujeito a suspensão. Entre em contato IMEDIATAMENTE."
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Message copied!");
    };

    if (loading) return <div className="p-8 text-center">Loading collections data...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(metrics?.agingBuckets || {}).map(([bucket, amount]: [string, any]) => (
                    <Card key={bucket} className={amount > 0 ? "border-red-200 bg-red-50/30" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Overdue {bucket} days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">R$ {(amount / 100).toLocaleString('pt-BR')}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Collection Scripts
                    </CardTitle>
                    <CardDescription>Use these templates to contact customers manually. Do not send automatically.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="1-30">
                        <TabsList>
                            <TabsTrigger value="1-30">Aging 1-30d</TabsTrigger>
                            <TabsTrigger value="31-60">Aging 31-60d</TabsTrigger>
                            <TabsTrigger value="60+">Aging 60d+</TabsTrigger>
                        </TabsList>
                        {Object.entries(templates).map(([key, text]) => (
                            <TabsContent key={key} value={key} className="space-y-4 pt-4">
                                <div className="p-4 rounded-lg border bg-slate-50 text-sm font-mono whitespace-pre-wrap">
                                    {text}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => copyToClipboard(text)}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy Text
                                    </Button>
                                    <Button variant="ghost" disabled>
                                        <ListChecks className="mr-2 h-4 w-4" /> Export List (CSV)
                                    </Button>
                                    {metrics?.agingBuckets[key] > 0 && (
                                        <Badge variant="destructive" className="h-9 px-4">
                                            Priority: {(metrics.agingBuckets[key] / 100).toLocaleString('pt-BR')} at risk
                                        </Badge>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-3 text-sm text-yellow-800">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                    <strong>Guardrail:</strong> Automated messaging is disabled in this version.
                    Review the client's profile before sending any collection notice to avoid friction.
                </p>
            </div>
        </div>
    );
}
