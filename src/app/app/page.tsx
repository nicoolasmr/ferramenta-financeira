"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, CreditCard, Activity } from "lucide-react";
import { getDashboardMetrics, getRecentSales, DashboardMetrics, RecentSale } from "@/actions/dashboard";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import Link from "next/link";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { Button } from "@/components/ui/button";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orgLoading) return;

        if (!activeOrganization) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [metricsData, salesData] = await Promise.all([
                    getDashboardMetrics(activeOrganization.id),
                    getRecentSales(activeOrganization.id)
                ]);
                setMetrics(metricsData);
                setRecentSales(salesData);
            } catch (err) {
                console.error("Error loading dashboard:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeOrganization, orgLoading]);

    if (orgLoading || loading) return <LoadingState />;

    if (!activeOrganization) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo ao RevenueOS</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Parece que você ainda não tem uma organização. Crie sua primeira organização para começar.
                </p>
                <Link href="/app/onboarding">
                    <Button size="lg" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Criar Nova Organização
                    </Button>
                </Link>
            </div>
        );
    }

    if (error) return <ErrorState message={error} retry={() => window.location.reload()} />;
    if (!metrics) return null;

    const kpis = [
        {
            title: "Total Revenue",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRevenue),
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            mom: metrics.revenueChange
        },
        {
            title: "Net Revenue",
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.netRevenue),
            icon: CreditCard,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            mom: metrics.netRevenueChange
        },
        {
            title: "Total Orders",
            value: metrics.totalOrders,
            icon: ShoppingCart,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            mom: metrics.ordersChange
        },
        {
            title: "Active Rate",
            value: metrics.activeRate,
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard (Real Data)</h1>
                    <p className="text-muted-foreground">Financial performance overview.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {kpi.title}
                                </CardTitle>
                                <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                {kpi.mom !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {kpi.mom >= 0 ? (
                                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={cn(
                                            "text-xs font-medium",
                                            kpi.mom >= 0 ? "text-emerald-500" : "text-red-500"
                                        )}>
                                            {Math.abs(kpi.mom).toFixed(1)}% vs last month
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Daily Revenue (Current Month)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `Dia ${val}`}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `R$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`R$ ${Number(value || 0).toFixed(2)}`, 'Revenue']}
                                    labelFormatter={(label) => `Dia ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Sales */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSales.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No sales yet. Connect an integration to start tracking.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentSales.map((sale) => (
                                    <div
                                        key={sale.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                                                {sale.initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{sale.customerName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sale.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                                            </p>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1 bg-green-50 text-green-700 border-green-200">
                                                {sale.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
