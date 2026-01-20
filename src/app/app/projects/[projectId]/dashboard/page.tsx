"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, UserCheck, AlertCircle, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

export default function ProjectDashboardPage() {
    const params = useParams();
    // const projectId = params.projectId; // Not used in mock yet but good to have

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ 120.000,00</div>
                        <p className="text-xs text-muted-foreground">Matches target</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Received</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">R$ 45.000,00</div>
                        <p className="text-xs text-muted-foreground">37.5% collected</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">R$ 2.400,00</div>
                        <p className="text-xs text-muted-foreground">3 installmnets late</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Adimplência</CardTitle>
                        <UserCheck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.2%</div>
                        <p className="text-xs text-muted-foreground">Above avg market rate</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Receivables Chart Stub */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Cash Flow Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center bg-slate-50 text-muted-foreground border border-dashed rounded-md">
                            Chart: Received vs Expected (Last 3m / Next 3m)
                        </div>
                    </CardContent>
                </Card>

                {/* At Risk Students */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Students at Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">John Doe</p>
                                        <p className="text-xs text-red-500">2 installments overdue</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">R$ 1.200,00</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>AS</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">Alice Smith</p>
                                        <p className="text-xs text-orange-500">1 installment overdue</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">R$ 600,00</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
