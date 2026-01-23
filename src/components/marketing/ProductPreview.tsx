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
                    <TabsList className="bg-slate-950/40 border border-white/5 p-1 rounded-xl">
                        <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Portfolio</TabsTrigger>
                        <TabsTrigger value="receivables" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Recebíveis</TabsTrigger>
                        <TabsTrigger value="reconciliation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300">Reconciliação</TabsTrigger>
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
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="receivables" className="p-6 focus-visible:ring-0">
                    <div className="space-y-4">
                        <ReceivableItem customer="Stripe Inc" date="24/01/2026" amount="R$ 1.200" status="pending" />
                        <ReceivableItem customer="Hotmart" date="25/01/2026" amount="R$ 850" status="overdue" />
                        <ReceivableItem customer="Asaas" date="26/01/2026" amount="R$ 2.400" status="pending" />
                        <ReceivableItem customer="Stripe Inc" date="27/01/2026" amount="R$ 1.200" status="pending" />
                    </div>
                </TabsContent>

                <TabsContent value="reconciliation" className="p-6 focus-visible:ring-0">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-24 bg-slate-800 rounded flex items-center justify-center text-xs">RAW</div>
                            <div className="text-slate-500">→</div>
                            <div className="h-10 w-24 bg-blue-900 rounded flex items-center justify-center text-xs">NORMALIZED</div>
                            <div className="text-slate-500">→</div>
                            <div className="h-10 w-24 bg-emerald-900 rounded flex items-center justify-center text-xs">APPLIED</div>
                        </div>
                        <p className="text-sm text-slate-400 font-mono">
                            Reconciliated: 1,429 events (100%)
                        </p>
                        <div className="mt-6 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-full bg-emerald-500"
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
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase font-semibold">{title}</span>
                <Icon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-end gap-2">
                <span className="text-xl font-bold">{value}</span>
                <span className="text-xs text-emerald-500 mb-1">{change}</span>
            </div>
        </div>
    );
}

function ReceivableItem({ customer, date, amount, status }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    status === "overdue" ? "bg-red-900/30 text-red-500" : "bg-blue-900/30 text-blue-500"
                )}>
                    {status === "overdue" ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                </div>
                <div>
                    <div className="text-sm font-semibold">{customer}</div>
                    <div className="text-[10px] text-slate-500">{date}</div>
                </div>
            </div>
            <div className="text-sm font-bold">{amount}</div>
        </div>
    );
}
