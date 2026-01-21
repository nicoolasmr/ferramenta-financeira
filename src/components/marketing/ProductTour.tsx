'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Cloud, LayoutDashboard, Settings, Wallet } from "lucide-react";
import Link from "next/link";

const FEATURES = [
    {
        id: "dashboard",
        label: "Dashboard de Receita",
        icon: LayoutDashboard,
        title: "Visibilidade Total do Portfólio",
        description: "Acompanhe MRR, Churn e Inadimplência em tempo real, consolidado de todas as fontes de pagamento.",
        color: "bg-blue-600"
    },
    {
        id: "reconciliation",
        label: "Reconciliação Automática",
        icon: Wallet,
        title: "Zero Discrepâncias Financeiras",
        description: "Bata cada centavo entre gateway, banco e ERP. Identifique taxas ocultas e vazamento de receita.",
        color: "bg-emerald-600"
    },
    {
        id: "integration",
        label: "Saúde das Integrações",
        icon: Cloud,
        title: "Monitoramento em Tempo Real",
        description: "Monitore a saúde dos seus webhooks e APIs. Replay automático de eventos com falha.",
        color: "bg-purple-600"
    }
];

export function ProductTour() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Por dentro do RevenueOS</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A única plataforma que conecta billing, banking e accounting em um fluxo contínuo.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    {/* Navigation */}
                    <div className="lg:col-span-4 space-y-4">
                        {FEATURES.map((feature, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`w-full text-left p-6 rounded-xl transition-all border-2 flex items-start gap-4 group ${activeTab === i
                                    ? "bg-white/10 border-white/20 shadow-lg"
                                    : "bg-transparent border-transparent hover:bg-white/5"
                                    }`}
                            >
                                <div className={`p-3 rounded-lg text-white shrink-0 ${activeTab === i ? feature.color : "bg-white/10"}`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg mb-1 ${activeTab === i ? "text-white" : "text-white/70"}`}>
                                        {feature.label}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </button>
                        ))}

                        <div className="pt-8">
                            <Link href="/demo">
                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-14 font-bold text-lg">
                                    Ver Demo Interativa <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mockup Display */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-2 shadow-2xl relative overflow-hidden aspect-[4/3] md:aspect-[16/10]">
                            {/* Browser Header */}
                            <div className="h-8 bg-slate-900 rounded-t-lg flex items-center px-4 gap-2 mb-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="flex-1 bg-slate-800 h-5 rounded-md mx-4 text-[10px] flex items-center justify-center text-slate-500 font-mono">
                                    app.revenueos.com/{FEATURES[activeTab].id}
                                </div>
                            </div>

                            {/* Screen Content - Real Professional UI */}
                            <div className="bg-slate-50 w-full h-full rounded text-slate-900 p-6 overflow-hidden relative">
                                {activeTab === 0 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold">Visão Geral do Portfólio</h2>
                                            <div className="bg-white border rounded-lg px-3 py-1.5 text-sm text-slate-600 font-medium">Últimos 30 dias</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1 uppercase font-semibold">MRR (Outubro)</div>
                                                <div className="text-2xl font-bold text-slate-900">R$ 482.390</div>
                                                <div className="text-xs text-emerald-600 mt-1">↑ 12% vs mês anterior</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1 uppercase font-semibold">Net Revenue</div>
                                                <div className="text-2xl font-bold text-slate-900">R$ 450.012</div>
                                                <div className="text-xs text-slate-500 mt-1">Após taxas e impostos</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1 uppercase font-semibold">Inadimplência</div>
                                                <div className="text-2xl font-bold text-amber-600">0.8%</div>
                                                <div className="text-xs text-emerald-600 mt-1">↓ 0.3% vs média</div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border shadow-sm h-48 flex items-end gap-1.5 pb-2 px-2">
                                            {/* Realistic Chart */}
                                            {[65, 70, 68, 75, 80, 78, 85, 88, 92, 95, 93, 100].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-500 text-center">Evolução do MRR - Jan a Dez 2026</div>
                                    </div>
                                )}

                                {activeTab === 1 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold">Auditoria de Reconciliação</h2>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Corrigir Automaticamente</Button>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg text-sm mb-4 flex items-start gap-3">
                                            <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">!</div>
                                            <div>
                                                <strong>3 Discrepâncias Detectadas</strong> entre Stripe e Banco Itaú. Total de R$ 47,50 não reconciliado.
                                            </div>
                                        </div>
                                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                            {[
                                                { id: "TXN-9847", desc: "Assinatura Premium - Cliente #2847", valor: "R$ 197,00", diff: "- R$ 19,70", tipo: "Taxa Gateway", status: "pending" },
                                                { id: "TXN-9848", desc: "Upgrade Plano Pro - Cliente #1923", valor: "R$ 397,00", diff: "- R$ 15,88", tipo: "IOF não contabilizado", status: "pending" },
                                                { id: "TXN-9849", desc: "Renovação Anual - Cliente #5612", valor: "R$ 1.188,00", diff: "- R$ 11,92", tipo: "Diferença cambial", status: "pending" },
                                            ].map((row, i) => (
                                                <div key={i} className="border-b last:border-0 p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-600 font-semibold">{row.id.split('-')[1]}</div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-slate-900">{row.desc}</div>
                                                            <div className="text-xs text-slate-500 mt-0.5">Hoje, 14:{20 + i}h • {row.valor}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-red-600">{row.diff}</div>
                                                        <div className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">{row.tipo}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 2 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl font-bold">Status das Integrações</h2>
                                            <div className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">Todos os Sistemas Operacionais</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-purple-500">
                                                <div className="font-bold flex justify-between items-center">
                                                    <span className="text-slate-900">Stripe</span>
                                                    <span className="text-emerald-600 text-lg">99.9%</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-2">Latência média: 240ms</div>
                                                <div className="text-xs text-slate-400 mt-1">Último evento: há 2 segundos</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-orange-500">
                                                <div className="font-bold flex justify-between items-center">
                                                    <span className="text-slate-900">Hotmart</span>
                                                    <span className="text-emerald-600 text-lg">99.5%</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-2">Latência média: 410ms</div>
                                                <div className="text-xs text-slate-400 mt-1">Último evento: há 5 segundos</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl mt-4 h-32 overflow-hidden leading-relaxed">
                                            <div className="opacity-70">&gt; monitorando webhooks em tempo real...</div>
                                            <div className="mt-1">&gt; [2026-02-21 15:00:01] evento recebido: invoice.paid</div>
                                            <div>&gt; [2026-02-21 15:00:02] processando regra de reconciliação #42</div>
                                            <div>&gt; [2026-02-21 15:00:02] match confirmado. ledger atualizado.</div>
                                            <div className="animate-pulse mt-1">&gt; _</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
