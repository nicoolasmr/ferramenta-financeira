"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/states/EmptyState";
import { LoadingState } from "@/components/states/LoadingState";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { EditDialog } from "@/components/dialogs/EditDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, type Customer } from "@/actions/customers";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

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
    {
        id: "actions",
        cell: ({ row }) => <CustomerActions customer={row.original} />,
    },
];

function CustomerActions({ customer }: { customer: Customer }) {
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const handleUpdate = async (data: Record<string, string>) => {
        try {
            await updateCustomer(customer.id, data);
            toast.success("Customer updated successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update customer");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCustomer(customer.id);
            toast.success("Customer deleted successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete customer");
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {showEdit && (
                <EditDialog
                    title="Edit Customer"
                    description="Update customer information"
                    fields={[
                        { name: "name", label: "Name", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "phone", label: "Phone", type: "text" },
                        { name: "document", label: "Document", type: "text" },
                    ]}
                    initialData={{
                        name: customer.name,
                        email: customer.email || "",
                        phone: customer.phone || "",
                        document: customer.document || "",
                    }}
                    onSubmit={handleUpdate}
                    trigger={<div />}
                />
            )}

            {showDelete && (
                <DeleteDialog
                    title="Delete Customer"
                    description="Are you sure you want to delete this customer?"
                    itemName={customer.name}
                    onConfirm={handleDelete}
                    trigger={<div />}
                />
            )}
        </>
    );
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomers("org-1")
            .then(setCustomers)
            .catch(() => toast.error("Failed to load customers"))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (data: Record<string, string>) => {
        try {
            await createCustomer({
                name: data.name,
                email: data.email,
                phone: data.phone,
                document: data.document,
                org_id: "org-1",
            });
            toast.success("Customer created successfully!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create customer");
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-slate-500">Manage your customer database</p>
                </div>
                <CreateDialog
                    title="Add Customer"
                    description="Create a new customer record"
                    fields={[
                        { name: "name", label: "Name", type: "text", required: true },
                        { name: "email", label: "Email", type: "email" },
                        { name: "phone", label: "Phone", type: "text" },
                        { name: "document", label: "Document (CPF/CNPJ)", type: "text" },
                    ]}
                    onSubmit={handleCreate}
                    triggerLabel="Add Customer"
                />
            </div>

            {customers.length === 0 ? (
                <EmptyState
                    title="No customers yet"
                    description="Start by adding your first customer"
                    action={
                        <CreateDialog
                            title="Add Customer"
                            description="Create a new customer record"
                            fields={[
                                { name: "name", label: "Name", type: "text", required: true },
                                { name: "email", label: "Email", type: "email" },
                                { name: "phone", label: "Phone", type: "text" },
                                { name: "document", label: "Document (CPF/CNPJ)", type: "text" },
                            ]}
                            onSubmit={handleCreate}
                            triggerLabel="Add Customer"
                        />
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
