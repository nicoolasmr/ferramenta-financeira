"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const agingData = [
    { bucket: "0-30 days", amount: 45000 },
    { bucket: "31-60 days", amount: 28000 },
    { bucket: "61-90 days", amount: 15000 },
    { bucket: "90+ days", amount: 8000 },
];

export default function AgingReportPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Aging Report</h1>
                <p className="text-slate-500">Analyze receivables by age</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {agingData.map((bucket) => (
                    <Card key={bucket.bucket}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {bucket.bucket}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(bucket.amount)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Aging Buckets Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={agingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="bucket" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
