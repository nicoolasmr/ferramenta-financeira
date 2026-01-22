"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/DataTable";
import { LoadingState } from "@/components/states/LoadingState";
import { getPayments, getPaymentsSummary, exportPayments, type Payment } from "@/actions/payments";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

export default function PaymentsPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState({ total_received: 0, total_pending: 0, total_failed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization) return;

        Promise.all([
            getPayments(activeOrganization.id),
            getPaymentsSummary(activeOrganization.id),
        ])
            .then(([paymentsData, summaryData]) => {
                setPayments(paymentsData);
                setSummary(summaryData);
            })
            .catch(() => toast.error("Failed to load payments"))
            .finally(() => setLoading(false));
    }, [activeOrganization]);

    const handleExport = async () => {
        if (!activeOrganization) return;
        try {
            const csv = await exportPayments(activeOrganization.id);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            toast.success("Payments exported!");
        } catch (error) {
            toast.error("Failed to export payments");
        }
    };

    const columns: ColumnDef<Payment>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("id")}</span>,
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"));
                return <span>R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const variants = {
                    paid: "bg-green-100 text-green-700",
                    pending: "bg-yellow-100 text-yellow-700",
                    failed: "bg-red-100 text-red-700",
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants]}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: "method",
            header: "Method",
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
        },
    ];

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-slate-500">View and manage all payment transactions</p>
                </div>
                <Button onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Received</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {summary.total_received.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            R$ {summary.total_pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            R$ {summary.total_failed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <DataTable columns={columns} data={payments} searchKey="method" />
                </CardContent>
            </Card>
        </div>
    );
}
