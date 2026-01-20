"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, CreditCard } from "lucide-react";

export default function ExportsPage() {

    // Simple direct download link approach
    const download = (type: string) => {
        window.open(`/api/exports/${type}`, '_blank');
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Exports</h1>
                <p className="text-muted-foreground">Download your data in CSV format.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Customers
                        </CardTitle>
                        <CardDescription>Export all registered customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => download('customers')} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download CSV
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" /> Payments
                        </CardTitle>
                        <CardDescription>Export all payment transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" onClick={() => download('payments')} className="w-full">
                            <Download className="mr-2 h-4 w-4" /> Download CSV
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
