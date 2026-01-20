"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, CreditCard, Banknote, QrCode } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data
const payments = [
    {
        id: "pay_1",
        order_id: "ord_1",
        method: "Credit Card",
        gateway: "Stripe",
        status: "captured",
        amount: "R$ 1.999,00",
        date: "2023-01-20 10:45 AM"
    },
    {
        id: "pay_2",
        order_id: "ord_2",
        method: "Pix",
        gateway: "Pagar.me",
        status: "pending",
        amount: "R$ 39,00",
        date: "2023-01-20 09:30 AM"
    },
    {
        id: "pay_3",
        order_id: "ord_3",
        method: "Boleto",
        gateway: "Pagar.me",
        status: "failed",
        amount: "R$ 299,00",
        date: "2023-01-19 4:20 PM"
    },
    {
        id: "pay_4",
        order_id: "ord_4",
        method: "Pix",
        gateway: "Stripe",
        status: "captured",
        amount: "R$ 99,00",
        date: "2023-01-19 11:15 AM"
    },
    {
        id: "pay_5",
        order_id: "ord_5",
        method: "Credit Card",
        gateway: "Stripe",
        status: "captured",
        amount: "R$ 39,00",
        date: "2023-01-18 08:00 AM"
    },
];

const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'credit card': return <CreditCard className="h-4 w-4" />;
        case 'pix': return <QrCode className="h-4 w-4" />;
        case 'boleto': return <Banknote className="h-4 w-4" />;
        default: return <CreditCard className="h-4 w-4" />;
    }
}

export default function PaymentsPage() {
    const [filter, setFilter] = useState("");

    const filteredPayments = payments.filter(
        (payment) =>
            payment.id.toLowerCase().includes(filter.toLowerCase()) ||
            payment.order_id.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Filter by ID..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="captured">Captured</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Gateway</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                                <TableCell className="font-mono text-xs text-primary">{payment.order_id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getMethodIcon(payment.method)}
                                        <span>{payment.method}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{payment.gateway}</TableCell>
                                <TableCell>{payment.date}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        payment.status === 'captured' ? 'default' :
                                            payment.status === 'pending' ? 'outline' :
                                                payment.status === 'failed' ? 'destructive' : 'secondary'
                                    }>
                                        {payment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{payment.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
