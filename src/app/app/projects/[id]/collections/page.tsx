"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    Handshake,
    CalendarCheck,
    CheckCircle2,
    MoreHorizontal,
    Plus,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
    { id: 'open', label: 'Em Aberto', icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'in_negotiation', label: 'Em Negociação', icon: Handshake, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'promised', label: 'Promessa de Pagto', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'paid', label: 'Recuperado', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function CollectionsKanbanPage() {
    const [cases] = useState([
        { id: '1', customer: 'João Silva', amount: 'R$ 850,00', days: 5, status: 'open', priority: 'High' },
        { id: '2', customer: 'Maria Santos', amount: 'R$ 1.200,00', days: 12, status: 'in_negotiation', priority: 'Medium' },
        { id: '3', customer: 'Tecno Soluções', amount: 'R$ 4.500,00', days: 2, status: 'promised', priority: 'Critical' },
        { id: '4', customer: 'Ana Oliveira', amount: 'R$ 320,00', days: 20, status: 'paid', priority: 'Low' },
    ]);

    return (
        <div className="flex flex-col gap-8 min-h-screen grid-bg pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Collections Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Recuperação de Receita WhatsApp-First</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="glass dark:glass-dark">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Caso
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4">
                        <div className={cn("flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm")}>
                            <div className="flex items-center gap-2">
                                <col.icon className={cn("w-4 h-4", col.color)} />
                                <span className="font-black text-[10px] uppercase tracking-widest">{col.label}</span>
                            </div>
                            <Badge variant="secondary" className="font-bold text-[10px]">
                                {cases.filter(c => c.status === col.id).length}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-3">
                            {cases.filter(c => c.status === col.id).map((item) => (
                                <Card key={item.id} className="glass dark:glass-dark border-none shadow-md hover:shadow-xl transition-all cursor-pointer group">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge className={cn(
                                                "text-[9px] font-black uppercase tracking-tighter",
                                                item.priority === 'Critical' ? "bg-red-100 text-red-700" :
                                                    item.priority === 'High' ? "bg-orange-100 text-orange-700" :
                                                        "bg-slate-100 text-slate-700"
                                            )}>
                                                {item.priority}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.customer}</h3>
                                        <div className="text-xl font-black text-blue-600 mb-3">{item.amount}</div>
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                                            <span>{item.days} dias em atraso</span>
                                            <div className="flex -space-x-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
