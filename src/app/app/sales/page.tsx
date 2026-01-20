"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Filter, Download } from "lucide-react";

// Mock Data
const orders = [
    {
        id: "ord_1",
        customer: "Olivia Martin",
        email: "olivia.martin@email.com",
        amount: "R$ 1.999,00",
        status: "Paid",
        date: "2023-01-20",
        method: "Credit Card"
    },
    {
        id: "ord_2",
        customer: "Jackson Lee",
        email: "jackson.lee@email.com",
        amount: "R$ 39,00",
        status: "Pending",
        date: "2023-01-20",
        method: "Pix"
    },
    {
        id: "ord_3",
        customer: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
        amount: "R$ 299,00",
        status: "Refunded",
        date: "2023-01-19",
        method: "Credit Card"
    },
    {
        id: "ord_4",
        customer: "William Kim",
        email: "will@email.com",
        amount: "R$ 99,00",
        status: "Paid",
        date: "2023-01-19",
        method: "Pix"
    },
    {
        id: "ord_5",
        customer: "Sofia Davis",
        email: "sofia.davis@email.com",
        amount: "R$ 39,00",
        status: "Paid",
        date: "2023-01-18",
        method: "Credit Card"
    },
];

export default function SalesPage() {
    const [filter, setFilter] = useState("");

    const filteredOrders = orders.filter(
        (order) =>
            order.customer.toLowerCase().includes(filter.toLowerCase()) ||
            order.email.toLowerCase().includes(filter.toLowerCase()) ||
            order.id.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Filter orders..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/app/sales/${order.id}`} className="hover:underline text-primary">
                                        {order.id}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{order.customer}</span>
                                        <span className="text-xs text-muted-foreground">{order.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Paid' ? 'default' : order.status === 'Pending' ? 'outline' : 'destructive'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{order.method}</TableCell>
                                <TableCell>{order.date}</TableCell>
                                <TableCell className="text-right">{order.amount}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>View details</DropdownMenuItem>
                                            <DropdownMenuItem>View customer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
