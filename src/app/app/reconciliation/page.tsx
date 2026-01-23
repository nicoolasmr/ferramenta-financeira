"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ArrowRight, RefreshCw, Check, X } from "lucide-react";
import { UploadOFXDialog } from "@/components/reconciliation/upload-ofx";
import { getReconciliationStats, getUnreconciledIds, findPotentialMatches, confirmMatch } from "@/actions/reconciliation";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { LoadingState } from "@/components/states/LoadingState";
import { toast } from "sonner";

export default function ReconciliationPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [stats, setStats] = useState({ pending: 0, matched: 0 });
    const [currentTransaction, setCurrentTransaction] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchingQueue, setMatchingQueue] = useState<string[]>([]);

    async function loadData() {
        if (!activeOrganization) return;
        setLoading(true);
        try {
            const s = await getReconciliationStats(activeOrganization.id);
            setStats(s);

            // Load matches queue
            const ids = await getUnreconciledIds(activeOrganization.id);
            setMatchingQueue(ids);

            if (ids.length > 0) {
                await loadNextMatch(activeOrganization.id, ids[0]);
            } else {
                setCurrentTransaction(null);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    async function loadNextMatch(orgId: string, txId: string) {
        const result = await findPotentialMatches(orgId, txId);
        if (result) {
            setCurrentTransaction(result.transaction);
            setCandidates(result.candidates);
        }
    }

    useEffect(() => {
        loadData();
    }, [activeOrganization]);

    const handleConfirm = async (paymentId: string) => {
        if (!currentTransaction) return;
        try {
            await confirmMatch(currentTransaction.id, paymentId);
            toast.success("Transaction reconciled!");

            // Move to next
            const nextQueue = matchingQueue.slice(1);
            setMatchingQueue(nextQueue);
            setStats(prev => ({ ...prev, pending: prev.pending - 1, matched: prev.matched + 1 }));

            if (nextQueue.length > 0 && activeOrganization) {
                await loadNextMatch(activeOrganization.id, nextQueue[0]);
            } else {
                setCurrentTransaction(null);
            }
        } catch (e) {
            toast.error("Failed to confirm match");
        }
    };

    const handleSkip = () => {
        // Just move to next in queue without matching
        const nextQueue = matchingQueue.slice(1);
        setMatchingQueue(nextQueue);
        if (nextQueue.length > 0 && activeOrganization) {
            loadNextMatch(activeOrganization.id, nextQueue[0]);
        } else {
            setCurrentTransaction(null);
        }
    };

    if (orgLoading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
                    <p className="text-slate-500">Match bank statement lines with system payments</p>
                </div>
                <UploadOFXDialog onUploadSuccess={loadData} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Reconciled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.matched}</div>
                    </CardContent>
                </Card>
            </div>

            {currentTransaction ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left: Bank Transaction */}
                    <Card className="border-l-4 border-l-blue-500 bg-slate-50/50">
                        <CardHeader>
                            <Badge className="w-fit mb-2" variant="outline">Bank Transaction</Badge>
                            <CardTitle>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTransaction.amount)}
                            </CardTitle>
                            <CardDescription>
                                {new Date(currentTransaction.date).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase">Description</div>
                                <div className="text-sm font-mono mt-1">{currentTransaction.description}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase">Transaction ID</div>
                                <div className="text-xs font-mono text-muted-foreground mt-1">{currentTransaction.transaction_id}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Matches */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Suggested Matches</CardTitle>
                                <Button variant="ghost" size="sm" onClick={handleSkip}>Skip <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </div>
                            <CardDescription>Select the corresponding payment from the system</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {candidates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No matches found within +/- 4 days and same amount.
                                </div>
                            ) : (
                                candidates.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                                                </span>
                                                <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>{payment.status}</Badge>
                                            </div>
                                            <div className="text-sm">{payment.customer?.name || "Unknown Customer"}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <Button size="sm" onClick={() => handleConfirm(payment.id)}>
                                            <Check className="mr-2 h-4 w-4" />
                                            Confirm
                                        </Button>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-medium">All Caught Up!</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            There are no pending transactions to reconcile. Upload a new OFX file to continue.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
