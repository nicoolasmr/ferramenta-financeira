"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PayoutReconciliationPage() {
    const mockTxs = [
        { id: "1", date: "2026-01-20", amount: 5000, provider: "Stripe", match: "Matched", confidence: 100 },
        { id: "2", date: "2026-01-21", amount: 1200, provider: "Hotmart", match: "Pending", confidence: 0 },
        { id: "3", date: "2026-01-22", amount: 450, provider: "Asaas", match: "Matched", confidence: 85 },
    ];

    return (
        <div className="space-y-6">
            <Card className="glass dark:glass-dark border-none shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-black">Conciliação de Repasses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold uppercase text-[10px]">Data</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Provedor</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Valor</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Confiança</TableHead>
                                <TableHead className="text-right font-bold uppercase text-[10px]">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTxs.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="text-slate-500 font-medium">{tx.date}</TableCell>
                                    <TableCell className="font-bold">{tx.provider}</TableCell>
                                    <TableCell className="font-black text-blue-600">R$ {tx.amount.toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "font-black text-[10px] uppercase",
                                            tx.match === 'Matched' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {tx.match}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${tx.confidence}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold">{tx.confidence}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="font-bold text-blue-600">
                                            Resolver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
