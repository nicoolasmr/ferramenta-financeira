"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { getCustomers, type Customer } from "@/actions/customers";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "document",
        header: "Document",
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
];

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomers("org-1")
            .then(setCustomers)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-slate-500">Manage your customer database</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            {customers.length === 0 ? (
                <EmptyState
                    title="No customers yet"
                    description="Start by adding your first customer"
                    action={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                        </Button>
                    }
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={customers}
                    searchKey="name"
                    searchPlaceholder="Search customers..."
                />
            )}
        </div>
    );
}
