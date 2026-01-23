"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const data = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 2100 },
    { name: "Mar", total: 1800 },
    { name: "Apr", total: 2400 },
    { name: "May", total: 3200 },
    { name: "Jun", total: 2800 },
];

export function ProductPreview() {
    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent text-white">
            <Tabs defaultValue="portfolio" className="w-full">
                <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-2">
                    <TabsList className="bg-slate-950/60 border border-white/10 p-1 rounded-xl">
                        <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400 rounded-lg transition-all duration-300">Portfolio</TabsTrigger>
                        <TabsTrigger value="receivables" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400 rounded-lg transition-all duration-300">Recebíveis</TabsTrigger>
                        <TabsTrigger value="reconciliation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-slate-400 rounded-lg transition-all duration-300">Reconciliação</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="portfolio" className="p-6 focus-visible:ring-0">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <KPICard title="Revenue (MRR)" value="R$ 42.500" change="+12.5%" icon={DollarSign} />
                        <KPICard title="Active Projects" value="14" change="+2" icon={TrendingUp} />
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="receivables" className="p-6 focus-visible:ring-0 text-white">
                    <div className="space-y-4">
                        <ReceivableItem customer="Stripe Inc" date="24/01/2026" amount="R$ 1.200" status="pending" />
                        <ReceivableItem customer="Hotmart" date="25/01/2026" amount="R$ 850" status="overdue" />
                        <ReceivableItem customer="Asaas" date="26/01/2026" amount="R$ 2.400" status="pending" />
                        <ReceivableItem customer="Stripe Inc" date="27/01/2026" amount="R$ 1.200" status="pending" />
                    </div>
                </TabsContent>

                <TabsContent value="reconciliation" className="p-6 focus-visible:ring-0">
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="flex items-center gap-3 lg:gap-4 mb-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-24 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">RAW</div>
                                <span className="text-[10px] text-slate-400 font-medium">Dados brutos</span>
                            </div>
                            <div className="text-slate-500 mb-6">→</div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-28 bg-blue-900/80 border border-blue-700 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">NORMALIZED</div>
                                <span className="text-[10px] text-slate-400 font-medium">Padronização</span>
                            </div>
                            <div className="text-slate-500 mb-6">→</div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-24 bg-emerald-900/80 border border-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg">APPLIED</div>
                                <span className="text-[10px] text-slate-400 font-medium">Registro Real</span>
                            </div>
                        </div>
                        <p className="text-sm text-emerald-400 font-mono font-bold bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
                            Reconciliated: 1,429 events (100%)
                        </p>
                        <div className="mt-8 w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
    );
}

function KPICard({ title, value, change, icon: Icon }: any) {
    return (
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl group hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider">{title}</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="h-4 w-4 text-blue-400" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-0.5">
                    {change}
                    <TrendingUp className="h-3 w-3" />
                </span>
            </div>
        </div>
    );
}

function ReceivableItem({ customer, date, amount, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    status === "overdue" ? "bg-red-500/20 text-red-400 border border-red-500/20" : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                )}>
                    {status === "overdue" ? <AlertCircle className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                </div>
                <div>
                    <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">{customer}</div>
                    <div className="text-xs text-slate-400 font-medium group-hover:text-slate-300">{date}</div>
                </div>
            </div>
            <div className="text-base font-black text-white">{amount}</div>
        </div>
    );
}
