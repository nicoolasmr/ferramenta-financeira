"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    AlertCircle,
    RefreshCcw,
    Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CashPortfolioPage() {
    // Mock data for MVP UI
    const kpis = [
        { title: "Recebido no Banco", value: "R$ 152.000,00", change: "+12%", icon: DollarSign, color: "text-emerald-600" },
        { title: "Repasses Esperados", value: "R$ 158.400,00", change: "-2%", icon: ArrowUpRight, color: "text-blue-600" },
        { title: "Delta (Caixa Real)", value: "-R$ 6.400,00", change: "Atenção", icon: AlertCircle, color: "text-red-600" },
        { title: "Taxa de Conciliação", value: "94.2%", change: "Bom", icon: CheckCircle2, color: "text-emerald-600" },
    ];

    const mockPayouts = [
        { id: "1", provider: "Stripe", date: "2026-01-20", amount: 5000, status: "matched", tx: "TRANSFER STRIPE X123" },
        { id: "2", provider: "Hotmart", date: "2026-01-21", amount: 1200, status: "unmatched", tx: "-" },
        { id: "3", provider: "Asaas", date: "2026-01-19", amount: 3500, status: "matched", tx: "TED ASAAS GESTAO" },
    ];

    return (
        <div className="flex flex-col gap-8 min-h-screen grid-bg pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Caixa Real (Portfolio)</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Open Finance & Conciliação Bancária</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="glass dark:glass-dark group">
                        <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                        Sincronizar Bancos
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Conectar Banco
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="glass dark:glass-dark border-none shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{kpi.title}</CardTitle>
                            <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-slate-800", kpi.color)}>
                                <kpi.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</div>
                            <div className="flex items-center gap-1 mt-1 text-xs font-bold">
                                <span className={kpi.color}>{kpi.change}</span>
                                <span className="text-slate-400 font-normal ml-1">vs. período anterior</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payout Reconciliation Table */}
            <Card className="glass dark:glass-dark border-none shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Repasses Recentes</CardTitle>
                        <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            Aguardando 12 transações
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="font-bold uppercase text-[10px]">Provedor</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Data Repasse</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Valor Líquido</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Entrada no Banco</TableHead>
                                <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
                                <TableHead className="text-right font-bold uppercase text-[10px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPayouts.map((payout) => (
                                <TableRow key={payout.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <TableCell className="font-bold">{payout.provider}</TableCell>
                                    <TableCell className="text-slate-500 font-medium">{payout.date}</TableCell>
                                    <TableCell className="font-black">R$ {payout.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{payout.tx}</span>
                                            {payout.status === 'matched' && <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Conciliado Automaticamente</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                "font-black text-[10px] uppercase tracking-wider",
                                                payout.status === 'matched'
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none dark:bg-emerald-900/40 dark:text-emerald-400"
                                                    : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none dark:bg-amber-900/40 dark:text-amber-400"
                                            )}
                                        >
                                            {payout.status === 'matched' ? 'Conciliado' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="font-bold text-blue-600">
                                            {payout.status === 'matched' ? 'Ver Detalhes' : 'Conciliar Manual'}
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
