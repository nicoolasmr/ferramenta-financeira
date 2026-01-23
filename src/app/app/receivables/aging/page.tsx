"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/states/LoadingState";
import { getAgingReport, exportAgingReport, type AgingBucket } from "@/actions/aging";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

export default function AgingReportPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [buckets, setBuckets] = useState<AgingBucket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization) return;

        getAgingReport(activeOrganization.id)
            .then(setBuckets)
            .catch(() => toast.error("Failed to load aging report"))
            .finally(() => setLoading(false));
    }, [activeOrganization]);

    const handleExport = async () => {
        if (!activeOrganization) return;
        try {
            const csv = await exportAgingReport(activeOrganization.id);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aging-report-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            toast.success("Report exported!");
        } catch (error) {
            toast.error("Failed to export report");
        }
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    const totalValue = buckets.reduce((sum, bucket) => sum + bucket.total_value, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Aging Report</h1>
                    <p className="text-slate-500">
                        Total Receivables: R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Aging Buckets */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {buckets.map((bucket) => (
                    <Card key={bucket.range}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">{bucket.range}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                R$ {bucket.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{bucket.count} receivables</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Aging Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={buckets}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number | undefined) =>
                                    `R$ ${(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                }
                            />
                            <Bar dataKey="total_value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Proactive Aging List */}
            {activeOrganization && <DetailedAgingList orgId={activeOrganization.id} />}
        </div>
    );
}

// Inner component to handle data fetching for the list specifically
import { getOverdueReceivables } from "@/actions/aging";
import { Badge } from "@/components/ui/badge";
import { ReminderDialog } from "@/components/receivables/reminder-dialog";

function DetailedAgingList({ orgId }: { orgId: string }) {
    const [receivables, setReceivables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOverdueReceivables(orgId)
            .then(setReceivables)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [orgId]);

    if (loading) return <div className="p-4 text-center">Loading detailed list...</div>;

    if (receivables.length === 0) return null; // No overdue items

    return (
        <Card>
            <CardHeader>
                <CardTitle>Overdue Receivables (Action Required)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 text-left font-medium text-slate-500">Customer</th>
                                <th className="p-3 text-left font-medium text-slate-500">Due Date</th>
                                <th className="p-3 text-left font-medium text-slate-500">Amount</th>
                                <th className="p-3 text-left font-medium text-slate-500">Days Overdue</th>
                                <th className="p-3 text-right font-medium text-slate-500">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receivables.map(r => {
                                const daysOverdue = Math.floor((new Date().getTime() - new Date(r.due_date).getTime()) / (1000 * 60 * 60 * 24));
                                return (
                                    <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="p-3">
                                            <div className="font-medium">{r.customer?.name || "Unknown"}</div>
                                            <div className="text-xs text-slate-500">{r.customer?.email}</div>
                                        </td>
                                        <td className="p-3 text-slate-600">{new Date(r.due_date).toLocaleDateString()}</td>
                                        <td className="p-3 font-medium">
                                            R$ {r.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={daysOverdue > 30 ? "destructive" : "secondary"}>
                                                {daysOverdue} days
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-right">
                                            <ReminderDialog
                                                receivableId={r.id}
                                                customerName={r.customer?.name || "Customer"}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
