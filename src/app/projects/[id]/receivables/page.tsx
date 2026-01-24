
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { Send, AlertTriangle, RefreshCw } from "lucide-react";

export default function ReceivablesPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);
    const supabase = createClient();

    useEffect(() => {
        load();
    }, [projectId]);

    async function load() {
        setLoading(true);
        // Logic: Get payments that are 'pending' or 'past_due' (depending on provider mapping)
        // For Stripe/Hotmart, status can be 'past_due', 'unpaid', 'pending'
        const { data } = await supabase.from('payments')
            .select('*')
            .eq('project_id', projectId)
            .in('status', ['past_due', 'pending', 'unpaid', 'created'])
            .order('created_at', { ascending: false })
            .limit(50);
        setPayments(data || []);
        setLoading(false);
    }

    async function handleRunDunning() {
        if (selected.length === 0) return;
        alert(`Simulating Dunning for ${selected.length} payments. In prod, this would enqueue jobs.`);
        // In real impl: await seedJobs(selected)
    }

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
        else setSelected([...selected, id]);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Receivables</h1>
                    <p className="text-muted-foreground">Monitor and recover overdue payments.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={load} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Button onClick={handleRunDunning} disabled={selected.length === 0 || loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        Run Dunning ({selected.length})
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Overdue Invoices</CardTitle>
                    <CardDescription>Select payments to manually trigger a reminder.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 w-[50px]"><Checkbox disabled /></th>
                                    <th className="p-4 font-medium">Customer/ID</th>
                                    <th className="p-4 font-medium">Provider</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Due</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No overdue payments found. Great job!
                                        </td>
                                    </tr>
                                )}
                                {payments.map(p => {
                                    const amount = (p.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: p.currency || 'BRL' });
                                    const isSelected = selected.includes(p.id);

                                    return (
                                        <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(p.id)} />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-mono text-xs">{p.provider_object_id}</div>
                                                <div className="text-xs text-muted-foreground break-all">{p.customer_id || "Unknown"}</div>
                                            </td>
                                            <td className="p-4 capitalize">
                                                <Badge variant="outline">{p.provider}</Badge>
                                            </td>
                                            <td className="p-4 font-bold">{amount}</td>
                                            <td className="p-4 text-amber-600 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                                                    {p.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
