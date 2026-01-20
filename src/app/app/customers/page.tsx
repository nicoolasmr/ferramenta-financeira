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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data
const customers = [
    {
        id: "cus_1",
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        orders: 15,
        spent: "R$ 4.200,00",
        lastPurchase: "2023-01-20",
        status: "Active"
    },
    {
        id: "cus_2",
        name: "Jackson Lee",
        email: "jackson.lee@email.com",
        orders: 2,
        spent: "R$ 89,00",
        lastPurchase: "2023-01-18",
        status: "Inactive"
    },
    {
        id: "cus_3",
        name: "Isabella Nguyen",
        email: "isabella.nguyen@email.com",
        orders: 8,
        spent: "R$ 1.250,00",
        lastPurchase: "2023-01-15",
        status: "Active"
    },
    {
        id: "cus_4",
        name: "William Kim",
        email: "will@email.com",
        orders: 1,
        spent: "R$ 99,00",
        lastPurchase: "2023-01-05",
        status: "Active"
    },
    {
        id: "cus_5",
        name: "Sofia Davis",
        email: "sofia.davis@email.com",
        orders: 4,
        spent: "R$ 390,00",
        lastPurchase: "2022-12-28",
        status: "Active"
    },
];

export default function CustomersPage() {
    const [filter, setFilter] = useState("");

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(filter.toLowerCase()) ||
            customer.email.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button size="sm">Add Customer</Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search customers..."
                        className="pl-8"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]"></TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Last Purchase</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCustomers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://avatar.vercel.sh/${customer.id}.png`} alt={customer.name} />
                                        <AvatarFallback>{customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Link href={`/app/customers/${customer.id}`} className="font-medium hover:underline text-primary">
                                            {customer.name}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                        {customer.status}
                                    </div>
                                </TableCell>
                                <TableCell>{customer.orders}</TableCell>
                                <TableCell>{customer.spent}</TableCell>
                                <TableCell>{customer.lastPurchase}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">Ban customer</DropdownMenuItem>
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
