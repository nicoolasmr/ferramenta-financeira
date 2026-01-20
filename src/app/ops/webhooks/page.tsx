"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const webhooks = [
    { id: "wh_1", see: "Stripe", event: "payment_intent.succeeded", status: "processed", time: "2023-01-20 10:45:12 AM" },
    { id: "wh_2", see: "Stripe", event: "charge.succeeded", status: "processed", time: "2023-01-20 10:45:10 AM" },
    { id: "wh_3", see: "Pagar.me", event: "transaction_captured", status: "processed", time: "2023-01-20 09:30:05 AM" },
    { id: "wh_4", see: "Hubspot", event: "contact.created", status: "failed", time: "2023-01-19 04:20:00 PM" },
    { id: "wh_5", see: "Stripe", event: "customer.created", status: "processed", time: "2023-01-19 11:15:00 AM" },
];

export default function WebhooksPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Received At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {webhooks.map((hook) => (
                            <TableRow key={hook.id}>
                                <TableCell className="font-mono text-xs">{hook.id}</TableCell>
                                <TableCell>{hook.see}</TableCell>
                                <TableCell className="font-mono text-xs">{hook.event}</TableCell>
                                <TableCell>
                                    <Badge variant={hook.status === 'processed' ? 'default' : 'destructive'}>
                                        {hook.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{hook.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
