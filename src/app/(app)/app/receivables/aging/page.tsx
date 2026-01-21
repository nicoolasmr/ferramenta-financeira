'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function AgingPage() {
    const buckets = [
        { label: 'Em dia', amount: 840000, percentage: 92, color: 'emerald' },
        { label: '1-30 dias', amount: 45000, percentage: 5, color: 'yellow' },
        { label: '31-60 dias', amount: 12000, percentage: 1.5, color: 'orange' },
        { label: '61-90 dias', amount: 8000, percentage: 1, color: 'red' },
        { label: '> 90 dias', amount: 5000, percentage: 0.5, color: 'red' },
    ];

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" />
                    Aging Report
                </h1>
                <p className="text-slate-600 mt-2">
                    Análise de inadimplência por período de vencimento.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {buckets.map((bucket, i) => (
                    <Card key={i} className={`border-l-4 border-l-${bucket.color}-500`}>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{bucket.label}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                R$ {(bucket.amount / 1000).toFixed(0)}k
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{bucket.percentage}% do total</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Evolução Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-end gap-2">
                        {[40, 45, 42, 38, 35, 32, 30, 28, 25, 22, 20, 18].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t" style={{ height: `${h * 2}%` }}></div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-slate-500 mt-4">
                        Redução de inadimplência nos últimos 12 meses
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
