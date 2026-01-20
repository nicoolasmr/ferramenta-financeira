"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

export default function ReconciliationPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reconciliation</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Internal Orders */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Internal Orders</CardTitle>
                        <div className="text-2xl font-bold">R$ 45.231,89</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">2,350 records</div>
                    </CardContent>
                </Card>

                {/* Gateway Payments */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Gateway Captured</CardTitle>
                        <div className="text-2xl font-bold">R$ 45.100,00</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">2,348 records</span>
                            <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">- R$ 131,89 diff</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Deposits */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Bank Payouts</CardTitle>
                        <div className="text-2xl font-bold">R$ 42.000,00</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">Settled (net of fees)</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Discrepancies</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Order #ord_1293</p>
                                    <p className="text-sm text-muted-foreground">Marked as Paid, but no Payment captured</p>
                                </div>
                            </div>
                            <Badge variant="destructive">Missing Payment</Badge>
                        </div>

                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="bg-yellow-100 p-2 rounded-full">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Payment #pay_9921</p>
                                    <p className="text-sm text-muted-foreground">Captured at Gateway, but Order is Pending</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Orphan Payment</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
