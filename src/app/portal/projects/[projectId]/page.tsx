"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, DollarSign, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

// Mock Data (matches Project Dashboard roughly)
const data = {
    projectName: "Mentoria Q1 2026",
    sales: "R$ 120.000,00",
    received: "R$ 45.000,00",
    collectedPct: 37.5,
    adimplencia: "98.2%",
    students: [
        { name: "A. Smith", status: "Active", paid: "50%", atRisk: false },
        { name: "B. Jones", status: "Active", paid: "10%", atRisk: false },
        { name: "C. Brown", status: "Active", paid: "20%", atRisk: true },
        // ...
    ]
};

export default function ClientPortalPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Portal Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">{data.projectName}</h1>
                        <p className="text-xs text-muted-foreground">Client Portal</p>
                    </div>
                </div>
                <Button variant="ghost" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Read Only
                </Button>
            </header>

            <main className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.sales}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Received</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{data.received}</div>
                            <p className="text-xs text-muted-foreground">{data.collectedPct}% collected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Adimplência</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.adimplencia}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Students Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.students.map((st, i) => (
                                <div key={i} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{st.name.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{st.name}</p>
                                            <p className="text-xs text-muted-foreground">{st.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-medium">{st.paid} Paid</div>
                                        {st.atRisk && <Badge variant="destructive">Late Payment</Badge>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
