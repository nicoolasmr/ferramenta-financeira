"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/states/LoadingState";
import { AlertCircle, MessageSquare, Mail, User, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function OverduePage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [overdueItems, setOverdueItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orgLoading) return;
        if (!activeOrganization) {
            setLoading(false);
            return;
        }

        const fetchOverdue = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("receivables")
                .select("*, payments(*, orders(*, customers(*)))")
                .eq("org_id", activeOrganization.id)
                .eq("status", "pending")
                .lt("due_date", new Date().toISOString())
                .order("due_date", { ascending: true });

            if (error) {
                toast.error("Erro ao carregar inadimplência");
            } else {
                setOverdueItems(data || []);
            }
            setLoading(false);
        };

        fetchOverdue();
    }, [activeOrganization, orgLoading]);

    if (orgLoading || loading) return <LoadingState />;

    const totalOverdue = overdueItems.reduce((acc, item) => acc + item.amount_cents, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-8 h-8" />
                        Inadimplência Ativa
                    </h1>
                    <p className="text-slate-500">Gestão de faturas vencidas e ações de recuperação.</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 md:px-8 text-center">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Total em Atraso</p>
                    <p className="text-3xl font-black text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdue / 100)}
                    </p>
                </div>
            </div>

            {overdueItems.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50">
                    <CardContent className="py-12 text-center text-slate-500">
                        Parabéns! Nenhuma fatura vencida encontrada. Seu caixa está saudável.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {overdueItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-red-500">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                    <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <User className="w-4 h-4" />
                                                {item.payments?.orders?.customers?.name || "Cliente Desconhecido"}
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900">
                                                Parcela {item.installment_number}/{item.total_installments}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                    Vencido há {Math.floor((new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 3600 * 24))} dias
                                                </Badge>
                                                <span className="text-xs text-slate-400 font-mono">Vencimento: {new Date(item.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-2xl font-black text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount_cents / 100)}
                                            </p>
                                            <p className="text-xs text-slate-400 uppercase font-black">Valor da Parcela</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 border-t md:border-t-0 md:border-l flex flex-row md:flex-col gap-2 justify-center">
                                        <Button variant="outline" className="flex-1 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                            <MessageSquare className="w-4 h-4" />
                                            WhatsApp
                                        </Button>
                                        <Button variant="outline" className="flex-1 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                                            <Mail className="w-4 h-4" />
                                            E-mail
                                        </Button>
                                        <Button variant="ghost" className="hidden md:flex gap-1 text-[10px] text-slate-400">
                                            Ver Perfil <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
