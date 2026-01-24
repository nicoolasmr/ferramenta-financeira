
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, CreditCard, Server } from "lucide-react";

export default function OpsDashboard() {
    return (
        <div className="space-y-8 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">RevenueOS Ops</h1>
                    <p className="text-muted-foreground">System health and business metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Activity className="w-3 h-3 mr-1" /> All Systems Operational
                    </Badge>
                </div>
            </div>

            {/* Business Metrics (The "SaaS" part) */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Revenue (MRR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">$12,450</div>
                        <div className="text-xs text-emerald-400">+15% vs last month</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">142</div>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px]">80 Pro</Badge>
                            <Badge variant="outline" className="text-[10px]">62 Starter</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Event Volume (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1.2M</div>
                        <div className="text-xs text-muted-foreground">98% Success Rate</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Backfills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">4</div>
                        <div className="text-xs text-muted-foreground">Avg Wait: 2 min</div>
                    </CardContent>
                </Card>
            </div>

            {/* Infra Health */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5" /> Connector Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Stripe</span>
                                <Badge className="bg-emerald-100 text-emerald-700">Healthy (23ms)</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Hotmart</span>
                                <Badge className="bg-emerald-100 text-emerald-700">Healthy (45ms)</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Asaas</span>
                                <Badge className="bg-emerald-100 text-emerald-700">Healthy (31ms)</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Latest Signups
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                                    <div>
                                        <div className="font-medium">Acme Corp {i}</div>
                                        <div className="text-xs text-muted-foreground">Plan: Pro</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">2m ago</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
