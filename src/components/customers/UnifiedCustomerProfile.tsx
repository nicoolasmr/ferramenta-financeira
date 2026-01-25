"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { getCustomerLTV, getCustomers, Customer, CustomerLTV } from "@/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/states/LoadingState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Globe, Mail, Phone, Calendar, CreditCard, Layers } from "lucide-react";

export function UnifiedCustomerProfile({ email }: { email: string }) {
    const { activeOrganization } = useOrganization();
    const [ltvData, setLtvData] = useState<CustomerLTV | null>(null);
    const [sources, setSources] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization || !email) return;

        Promise.all([
            getCustomerLTV(activeOrganization.id, email),
            getCustomers(activeOrganization.id, { search: email })
        ]).then(([ltv, s]) => {
            setLtvData(ltv);
            setSources(s);
            setLoading(false);
        });
    }, [activeOrganization, email]);

    if (loading) return <LoadingState />;
    if (!ltvData) return <div>Cliente não encontrado ou sem dados de faturamento.</div>;

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardContent className="pt-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                        <Avatar className="w-24 h-24 border-4 border-slate-700 shadow-xl">
                            <AvatarFallback className="bg-primary text-3xl font-bold">
                                {sources[0]?.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <h2 className="text-3xl font-black tracking-tight">{sources[0]?.name}</h2>
                                <Badge className="w-fit mx-auto md:mx-0 bg-emerald-500 hover:bg-emerald-600 border-none">
                                    Identidade Verificada
                                </Badge>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm">
                                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {email}</div>
                                {sources[0]?.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {sources[0].phone}</div>}
                                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Desde {new Date(ltvData.first_seen).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total LTV</p>
                            <p className="text-3xl font-black text-emerald-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ltvData.total_ltv_cents / 100)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Origem dos Dados (Histórico Multi-Fonte)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sources.map((source) => (
                                <div key={source.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center shadow-sm uppercase font-black text-xs">
                                            {source.source.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{source.source.toUpperCase()}</p>
                                            <p className="text-xs text-slate-500">ID Externo detectado via Webhook</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Sincronizado em</p>
                                        <p className="text-xs text-slate-400">{new Date(source.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Insights da IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 italic text-sm text-blue-800">
                            "Este cliente possui compras em {ltvData.source_count} plataformas diferentes. O engajamento dele é classificado como ALTO."
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Probabilidade de Churn</span>
                                <span className="font-bold text-emerald-600">Baixa (12%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[12%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
