"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    AlertTriangle,
    Clock,
    Zap,
    Play,
    Info,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntegrationChecklistPage({ params }: { params: Promise<{ id: string, provider: string }> }) {
    const resolvedParams = React.use(params);
    const steps = [
        { title: "Configuração no Provedor", status: "completed", description: "Configurar webhooks e chaves de API no painel do provedor." },
        { title: "Recebimento de Dados", status: "completed", description: "O RevenueOS recebeu os primeiros eventos com sucesso." },
        { title: "Mapeamento Canário", status: "warning", description: "Alguns campos opcionais estão ausentes nos eventos recentes." },
    ];

    return (
        <div className="flex flex-col gap-8 min-h-screen grid-bg pb-12">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Certificação de Integração</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Health, Latency & Event Trail</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Canary Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-emerald-600">92/100</div>
                        <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Healthy</Badge>
                    </CardContent>
                </Card>
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Freshness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-blue-600">2m ago</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Último evento processado</p>
                    </CardContent>
                </Card>
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Fail Rate (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">0.02%</div>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-tighter">Dentro da margem de segurança</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass dark:glass-dark border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Checklist de Certificação</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/30 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white/50">
                            <div className={cn(
                                "p-2 rounded-full",
                                step.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                            )}>
                                {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                <p className="text-sm text-slate-500">{step.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="glass dark:glass-dark border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-black">Event Trail UI (Raw → Applied)</CardTitle>
                    <Button size="sm" variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                        <Search className="w-3 h-3 mr-2" />
                        Filtrar Logs
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-8 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 p-2 bg-blue-100 text-blue-600 rounded-full border-4 border-white dark:border-slate-950">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-xs uppercase text-slate-400">Step 1</span>
                                    <Badge className="bg-slate-900 text-[9px]">RAW PAYLOAD</Badge>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-blue-400 overflow-x-auto">
                                    {`{ "event": "invoice.paid", "data": { "id": "in_123", "amount": 50000 } }`}
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 p-2 bg-emerald-100 text-emerald-600 rounded-full border-4 border-white dark:border-slate-950">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-xs uppercase text-slate-400">Step 2</span>
                                    <Badge className="bg-emerald-600 text-[9px]">NORMALIZED</Badge>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                                    <div className="grid grid-cols-2 gap-2 font-bold text-slate-700 dark:text-slate-300">
                                        <span>Type: INVOICE_PAID</span>
                                        <span>Amount: R$ 500,00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 p-2 bg-purple-100 text-purple-600 rounded-full border-4 border-white dark:border-slate-950">
                                <Play className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-xs uppercase text-slate-400">Step 3</span>
                                    <Badge className="bg-purple-600 text-[9px]">APPLIED ROWS</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">order_id: ord_999</Badge>
                                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">payment_id: pay_111</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
