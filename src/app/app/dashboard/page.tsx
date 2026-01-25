"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, ShoppingCart, Activity, ArrowUpRight } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { BelvoDashboardBlock } from "@/components/dashboard/BelvoDashboardBlock";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { PortfolioHealthBlock } from "@/components/dashboard/PortfolioHealthBlock";
import { TopAnomaliesBlock } from "@/components/dashboard/TopAnomaliesBlock";

const data = [
    { name: 'Jan', total: 12000 },
    { name: 'Feb', total: 18000 },
    { name: 'Mar', total: 22000 },
    { name: 'Apr', total: 17000 },
    { name: 'May', total: 25000 },
    { name: 'Jun', total: 31000 },
    { name: 'Jul', total: 29000 },
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("portfolio");
    const { t } = useLanguage();
    const { activeOrganization } = useOrganization();

    return (
        <div className="flex flex-col gap-8 min-h-screen grid-bg pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t("common.dashboard")}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Visão Geral da Operação</p>
                </div>

                {/* Modern Tab Switcher */}
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800">
                    {["portfolio", "receivables", "reconciliation"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg",
                                activeTab === tab
                                    ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {t(`common.${tab}`)}
                        </button>
                    ))}
                </div>
            </div>



            // ... inside component ...

            {/* Belvo "Caixa Real" Block */}
            {activeOrganization && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PortfolioHealthBlock orgId={activeOrganization.id} />
                    <TopAnomaliesBlock orgId={activeOrganization.id} />
                </div>
            )}

            {activeOrganization && <BelvoDashboardBlock orgId={activeOrganization.id} />}

            <OnboardingChecklist />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: t("common.revenue"), value: "R$ 45.231,89", change: "+20.1%", icon: DollarSign },
                    { title: t("common.orders"), value: "+2350", change: "+180.1%", icon: ShoppingCart },
                    { title: t("common.net_revenue"), value: "R$ 42.100,50", change: "+19%", icon: CreditCard },
                    { title: t("common.active_rate"), value: t("common.active_rate"), change: "+0.2%", icon: Activity },
                ].map((kpi, i) => (
                    <Card key={i} className="glass dark:glass-dark group hover:border-blue-500/50 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{kpi.title}</CardTitle>
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <kpi.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{kpi.value}</div>
                            <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
                                <ArrowUpRight className="h-3 w-3" />
                                {kpi.change}
                                <span className="text-slate-400 font-normal ml-1">last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass dark:glass-dark">
                    <CardHeader>
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass dark:glass-dark">
                    <CardHeader>
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+R$ 1.999,00", init: "OM" },
                                { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+R$ 39,00", init: "JL" },
                                { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+R$ 299,00", init: "IN" },
                                { name: "William Kim", email: "will@email.com", amount: "+R$ 99,00", init: "WK" },
                                { name: "Sofia Davis", email: "sofia@email.com", amount: "+R$ 39,00", init: "SD" },
                            ].map((sale, i) => (
                                <div key={i} className="flex items-center group cursor-default">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform">
                                        {sale.init}
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sale.name}</p>
                                        <p className="text-xs text-slate-500">{sale.email}</p>
                                    </div>
                                    <div className="ml-auto font-black text-slate-900 dark:text-white">{sale.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

