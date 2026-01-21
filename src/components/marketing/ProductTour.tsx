'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Cloud, LayoutDashboard, Settings, Wallet } from "lucide-react";
import Link from "next/link";

const FEATURES = [
    {
        id: "dashboard",
        label: "Portfolio Dashboard",
        icon: LayoutDashboard,
        title: "Visibilidade Total",
        description: "Acompanhe MRR, Churn e Inadimplência em tempo real, consolidado de todas as fontes.",
        color: "bg-blue-600"
    },
    {
        id: "reconciliation",
        label: "Reconciliação (Delta)",
        icon: Wallet,
        title: "Zero Discrepância",
        description: "Bata cada centavo entre Stripe, Banco e ERP. Identifique taxas ocultas e revenue leakage.",
        color: "bg-emerald-600"
    },
    {
        id: "integration",
        label: "Integrations Health",
        icon: Cloud,
        title: "Ops Monitoring",
        description: "Monitore a saúde dos seus webhooks. Replay automático de eventos falhos.",
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

                            {/* Screen Content - Simulated High-Fi UI */}
                            <div className="bg-slate-50 w-full h-full rounded text-slate-900 p-6 overflow-hidden relative">
                                {activeTab === 0 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-bold">Dashboard</h2>
                                            <div className="bg-white border rounded px-3 py-1 text-sm text-slate-500">Last 30 days</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1">MRR</div>
                                                <div className="text-2xl font-bold">R$ 1.2M</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1">Net Revenue</div>
                                                <div className="text-2xl font-bold">R$ 1.05M</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="text-slate-500 text-xs mb-1">Churn Rate</div>
                                                <div className="text-2xl font-bold text-red-500">2.1%</div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border shadow-sm h-48 flex items-end gap-2 pb-2 px-2">
                                            {/* Fake Chart */}
                                            {[40, 60, 45, 70, 80, 75, 90, 85, 95, 100].map((h, i) => (
                                                <div key={i} className="flex-1 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 1 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-bold">Recon Audit</h2>
                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Auto-Fix</Button>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg text-sm mb-4">
                                            <strong>4 Discrepâncias</strong> encontradas entre Stripe e Banco Itaú.
                                        </div>
                                        <div className="bg-white border rounded-lg shadow-sm">
                                            {[1, 2, 3].map(row => (
                                                <div key={row} className="border-b last:border-0 p-4 flex justify-between items-center bg-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-mono text-xs text-slate-500">TX</div>
                                                        <div>
                                                            <div className="font-bold text-sm">Transfer #{9000 + row}</div>
                                                            <div className="text-xs text-slate-500">Today, 10:23 AM</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-red-600">- R$ 15,00</div>
                                                        <div className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded inline-block">Fee Mismatch</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 2 && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-2xl font-bold">Integration Health</h2>
                                            <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold uppercase">All Systems Operational</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-purple-500">
                                                <div className="font-bold flex justify-between">Stripe <span className="text-emerald-500">99.9%</span></div>
                                                <div className="text-xs text-slate-500 mt-2">Latency: 240ms</div>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-orange-500">
                                                <div className="font-bold flex justify-between">Hotmart <span className="text-emerald-500">99.5%</span></div>
                                                <div className="text-xs text-slate-500 mt-2">Latency: 410ms</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl mt-4 h-32 overflow-hidden">
                                            <div>&gt; listening for webhooks...</div>
                                            <div>&gt; [2026-02-21 15:00:01] event received: invoice.paid</div>
                                            <div>&gt; [2026-02-21 15:00:02] processing reconciliation rule #42</div>
                                            <div>&gt; [2026-02-21 15:00:02] match confirmed. ledger updated.</div>
                                            <div className="animate-pulse">&gt; _</div>
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
