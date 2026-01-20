"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { renegotiateInstallments } from "@/lib/purchases/enrollment-actions";

export function RenegotiateDialog({
    orgId,
    enrollmentId,
    projectId,
    selectedInstallments,
    children
}: {
    orgId: string,
    enrollmentId: string,
    projectId: string,
    selectedInstallments: any[],
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCount, setNewCount] = useState(1);
    const [startDate, setStartDate] = useState("");
    const { toast } = useToast();

    const totalAmount = selectedInstallments.reduce((acc, curr) => acc + curr.amount_cents, 0);

    const handleRenegotiate = async () => {
        setLoading(true);
        try {
            // Simple logic: split total equally
            const newAmount = Math.floor(totalAmount / newCount);
            const newInstallments = Array.from({ length: newCount }).map((_, i) => ({
                installment_number: 900 + i, // visual indicator of renegotiation
                amount_cents: newAmount,
                due_date: startDate, // Simply putting all on same start date for MVP or +30 days logic needed
                plan_id: selectedInstallments[0].plan_id // Link to same plan
            }));

            await renegotiateInstallments(
                orgId,
                enrollmentId,
                projectId,
                selectedInstallments.map(i => i.id),
                newInstallments
            );

            toast({ title: "Success", description: "Installments renegotiated." });
            setOpen(false);
        } catch (e) {
            toast({ title: "Error", description: "Renegotiation failed.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Renegotiate {selectedInstallments.length} Installments</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="bg-slate-100 p-3 rounded text-sm mb-2">
                        Amount to Renegotiate: <strong>{(totalAmount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                    <div className="grid gap-2">
                        <Label>New Number of Installments</Label>
                        <Input type="number" min={1} max={12} value={newCount} onChange={e => setNewCount(Number(e.target.value))} />
                    </div>
                    <div className="grid gap-2">
                        <Label>First Due Date</Label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleRenegotiate} disabled={loading || !startDate}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm New Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
