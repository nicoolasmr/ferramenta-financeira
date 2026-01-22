"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/states/LoadingState";
import { getAgingReport, exportAgingReport, type AgingBucket } from "@/actions/aging";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AgingReportPage() {
    const [buckets, setBuckets] = useState<AgingBucket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAgingReport("org-1")
            .then(setBuckets)
            .catch(() => toast.error("Failed to load aging report"))
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        try {
            const csv = await exportAgingReport("org-1");
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

    if (loading) return <LoadingState />;

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
                                formatter={(value: number) =>
                                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                }
                            />
                            <Bar dataKey="total_value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
