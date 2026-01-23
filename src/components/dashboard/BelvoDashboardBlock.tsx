"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Landmark, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Use client for real-time subs if needed, or server action wrapper
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface CashRealSummary {
    total_in: number;
    total_out: number;
    last_sync_at: string | null;
    tx_count: number;
}

export function BelvoDashboardBlock({ orgId, projectId }: { orgId?: string, projectId?: string }) {
    const [summary, setSummary] = useState<CashRealSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!orgId) return;
        setLoading(true);
        try {
            const supabase = createClient();
            // Fetch from the view we created
            let query = supabase
                .from('cash_real_summary_view')
                .select('*')
                .eq('org_id', orgId);

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query.single();

            if (error && error.code !== 'PGRST116') throw error; // 116 is no rows

            if (data) {
                setSummary({
                    total_in: data.total_in || 0,
                    total_out: data.total_out || 0,
                    last_sync_at: data.last_sync_at,
                    tx_count: data.tx_count || 0
                });
            } else {
                setSummary(null); // No data yet
            }
        } catch (err: any) {
            console.error(err);
            setError("Falha ao carregar Caixa Real");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [orgId]);

    const handleRefresh = async () => {
        // Trigger manual sync via API or Server Action
        // For MVP, just reload view data, assuming backend cron or webhook updates it
        await loadData();
    };

    if (loading) {
        return (
            <Card className="glass dark:glass-dark animate-pulse">
                <CardHeader>
                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-20 bg-slate-200 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    if (!summary && !error) {
        return (
            <Card className="glass dark:glass-dark border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-3 bg-slate-100 rounded-full mb-3">
                        <Landmark className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Nenhum dado bancário</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                        Conecte sua conta bancária para ver o fluxo de caixa real.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/app/integrations">Conectar Banco</a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass dark:glass-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Landmark className="w-32 h-32 text-blue-900 dark:text-blue-100" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-blue-600" />
                    Caixa Real
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent>
                {error ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                ) : summary ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Entradas (30d)</p>
                            <div className="flex items-center gap-1 text-emerald-600">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-xl font-black tracking-tight">{formatCurrency(summary.total_in)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Saídas (30d)</p>
                            <div className="flex items-center gap-1 text-red-600">
                                <ArrowDownLeft className="h-4 w-4" />
                                <span className="text-xl font-black tracking-tight">{formatCurrency(summary.total_out)}</span>
                            </div>
                        </div>

                        <div className="col-span-2 mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>{summary.tx_count} transações sincronizadas</span>
                            <span>Atualizado: {summary.last_sync_at ? new Date(summary.last_sync_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
