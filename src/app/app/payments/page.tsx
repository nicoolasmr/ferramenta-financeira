"use client";

import { DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface Payment {
    id: string;
    customer: string;
    amount: number;
    status: string;
    method: string;
    date: string;
}

const payments: Payment[] = [
    {
        id: "1",
        customer: "Olivia Martin",
        amount: 1899.0,
        status: "paid",
        method: "Credit Card",
        date: "2024-01-22",
    },
    {
        id: "2",
        customer: "Jackson Lee",
        amount: 39.0,
        status: "paid",
        method: "PIX",
        date: "2024-01-21",
    },
    {
        id: "3",
        customer: "Isabella Nguyen",
        amount: 299.0,
        status: "pending",
        method: "Boleto",
        date: "2024-01-20",
    },
    {
        id: "4",
        customer: "William Kim",
        amount: 99.0,
        status: "failed",
        method: "Credit Card",
        date: "2024-01-19",
    },
];

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "customer",
        header: "Customer",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) =>
            new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(row.original.amount),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    className={
                        status === "paid"
                            ? "bg-green-100 text-green-700"
                            : status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                    }
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "method",
        header: "Method",
    },
    {
        accessorKey: "date",
        header: "Date",
    },
];

export default function PaymentsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-slate-500">View all payment transactions</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 border rounded-lg bg-white">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Total Received
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(2237)}
                    </div>
                </div>
                <div className="p-6 border rounded-lg bg-white">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Pending
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(299)}
                    </div>
                </div>
                <div className="p-6 border rounded-lg bg-white">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Failed
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(99)}
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={payments}
                searchKey="customer"
                searchPlaceholder="Search payments..."
            />
        </div>
    );
}
