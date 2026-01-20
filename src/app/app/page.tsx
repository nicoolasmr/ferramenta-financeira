"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPortfolioFinancials, getTopProjects } from "@/actions/dashboard/global-actions";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommandCenterPage() {
    const [financials, setFinancials] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hardcoded org-1 for MVP context
        Promise.all([
            getPortfolioFinancials("org-1"),
            getTopProjects("org-1")
        ]).then(([finData, projData]) => {
            setFinancials(finData || {
                total_volume_cents: 0,
                total_received_cents: 0,
                total_overdue_cents: 0,
                total_open_cents: 0
            });
            setProjects(projData || []);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="space-y-4 p-8">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
    </div>;

    const formatCurrency = (cents: number) => {
        return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
                <p className="text-muted-foreground">Global financial overview across all projects.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(financials.total_volume_cents)}</div>
                        <p className="text-xs text-muted-foreground">All time contracted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Received</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(financials.total_received_cents)}</div>
                        <p className="text-xs text-muted-foreground">Successfully collected</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue (Risk)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(financials.total_overdue_cents)}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Receivables</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(financials.total_open_cents)}</div>
                        <p className="text-xs text-muted-foreground">Future revenue flow</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded-md bg-slate-50">
                            Chart Component Placeholder (Recharts)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Projects</CardTitle>
                        <CardDescription>By enrollment volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {projects.map((proj: any) => (
                                <div key={proj.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{proj.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {proj.enrollments[0]?.count || 0} enrollments
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {/* Ideally fetch revenue per project */}
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
