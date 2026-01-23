"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    ShieldAlert,
    TrendingUp,
    Users,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RiskHubPage() {
    return (
        <div className="flex flex-col gap-8 min-h-screen grid-bg pb-12">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Risk Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Early Warning: Chargebacks & Refunds</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="glass dark:glass-dark border-none shadow-xl border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Alertas Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-red-600">3</div>
                        <p className="text-[10px] font-bold text-red-400 mt-2 uppercase tracking-tighter italic">Requer Atenção Imediata</p>
                    </CardContent>
                </Card>
                <Card className="glass dark:glass-dark border-none shadow-xl border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Taxa de Reembolso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-amber-600">2.4%</div>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500 uppercase">+0.8% esta semana</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Chargebacks (MTD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">12</div>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-tighter">Abaixo do limite de 1%</p>
                    </CardContent>
                </Card>
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Clientes Alto Risco</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">45</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest uppercase">Score {`> 70`}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-xl font-black">Principais Alertas</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-900/40">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-red-900 dark:text-red-400">Anomalia de Reembolso</h4>
                                    <p className="text-xs text-red-700 dark:text-red-500/80 mb-2">Projeto X: Aumento de 400% em solicitações de reembolso nas últimas 12h.</p>
                                    <Badge className="bg-red-600 text-[9px] uppercase font-black">Crítico</Badge>
                                </div>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-[10px] font-bold">AGIR AGORA</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass dark:glass-dark border-none shadow-xl">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-xl font-black">Clientes Suspeitos</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-white/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">JD</div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">John Doe {i}</p>
                                        <p className="text-xs text-slate-500">Risk Score: 87</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
