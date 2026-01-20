"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export default function ProjectOrdersPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Orders</h2>
                <p className="text-sm text-muted-foreground">Transactions and Sales for this project.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Real-time feed from integrations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                        <p>No orders found yet.</p>
                        <p className="text-sm">Configure an integration to start receiving sales.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
