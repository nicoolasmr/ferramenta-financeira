"use client";

import { TrendingUp, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const funnelStages = [
    { name: "Leads", count: 150, value: 0, icon: Users },
    { name: "Qualified", count: 80, value: 0, icon: TrendingUp },
    { name: "Proposal", count: 45, value: 225000, icon: DollarSign },
    { name: "Negotiation", count: 25, value: 187500, icon: DollarSign },
    { name: "Closed Won", count: 15, value: 150000, icon: DollarSign },
];

export default function SalesFunnelPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sales Funnel</h1>
                <p className="text-slate-500">Track your sales pipeline</p>
            </div>

            <div className="grid gap-4">
                {funnelStages.map((stage, index) => {
                    const Icon = stage.icon;
                    const conversionRate = index > 0
                        ? ((stage.count / funnelStages[index - 1].count) * 100).toFixed(1)
                        : "100.0";

                    return (
                        <Card key={stage.name}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{stage.name}</CardTitle>
                                            <p className="text-sm text-slate-500">
                                                {stage.count} opportunities
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">
                                            {stage.value > 0
                                                ? new Intl.NumberFormat("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                }).format(stage.value)
                                                : "-"}
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {conversionRate}% conversion
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
