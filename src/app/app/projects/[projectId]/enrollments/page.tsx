"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Filter, MoreHorizontal, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { calculateInstallmentStatus } from "@/lib/scheduling/utils";

// Enhanced Mock Data
const enrollments = [
    {
        id: "enr_1",
        customer: { name: "Alice Smith", email: "alice@example.com", image: "" },
        status: "Active",
        niche: "Fitness",
        cycle: "Jan 2026 - Jun 2026",
        financial: {
            total: 1000000, // cents
            paid: 500000,
            next_due: "2026-02-01",
            next_amount: 100000,
            installments: [
                { status: 'paid', due_date: '2026-01-01' },
                { status: 'pending', due_date: '2026-02-01' } // Pending
            ]
        }
    },
    {
        id: "enr_2",
        customer: { name: "Bob Jones", email: "bob@example.com", image: "" },
        status: "Onboarding",
        niche: "Marketing",
        cycle: "Feb 2026 - Jul 2026",
        financial: {
            total: 1200000,
            paid: 0,
            next_due: "2026-02-15", // Pending Entry
            next_amount: 200000,
            installments: [
                { status: 'pending', due_date: '2026-02-15' }
            ]
        }
    },
    {
        id: "enr_3",
        customer: { name: "Charlie Brown", email: "charlie@example.com", image: "" },
        status: "Active",
        niche: "Finance",
        cycle: "Jan 2026 - Jun 2026",
        financial: {
            total: 1000000,
            paid: 200000,
            next_due: "2026-01-15", // Overdue!
            next_amount: 100000,
            installments: [
                { status: 'paid', due_date: '2025-12-15' },
                { status: 'pending', due_date: '2026-01-15' } // Overdue
            ]
        }
    }
];

export default function ProjectEnrollmentsPage() {
    const params = useParams();
    const [filter, setFilter] = useState("all"); // all, overdue, active

    const filteredEnrollments = enrollments.filter(enr => {
        if (filter === 'overdue') {
            // Check if any installment is calculated as overdue
            const hasOverdue = enr.financial.installments.some(i =>
                calculateInstallmentStatus(i, 0) === 'overdue' // calculated dynamically
            );
            return hasOverdue;
        }
        if (filter === 'active') return enr.status === 'Active';
        return true;
    });

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Enrollments</h2>
                <div className="flex gap-2">
                    <Link href={`/app/projects/${params.projectId}/enrollments/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Enrollment
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search students..."
                        className="pl-8"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter: {filter === 'all' ? 'All' : filter === 'overdue' ? 'Overdue' : 'Active'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked={filter === 'all'} onCheckedChange={() => setFilter('all')}>
                            All Students
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filter === 'active'} onCheckedChange={() => setFilter('active')}>
                            Active Only
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={filter === 'overdue'} onCheckedChange={() => setFilter('overdue')} className="text-red-600">
                            Overdue Payments
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Cycle & Niche</TableHead>
                            <TableHead>Financial Status</TableHead>
                            <TableHead>Next Due</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEnrollments.map((enr) => {
                            // Determine overall financial status based on installments
                            const isOverdue = enr.financial.installments.some(i => calculateInstallmentStatus(i, 0) === 'overdue');
                            const progress = Math.round((enr.financial.paid / enr.financial.total) * 100);

                            return (
                                <TableRow key={enr.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={enr.customer.image} />
                                                <AvatarFallback>{enr.customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{enr.customer.name}</span>
                                                <span className="text-xs text-muted-foreground">{enr.customer.email}</span>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5">{enr.status}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{enr.niche}</span>
                                            <span className="text-xs text-muted-foreground">{enr.cycle}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 w-32">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Paid</span>
                                                <span className="font-medium">{progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${isOverdue ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(enr.financial.paid)} / {formatCurrency(enr.financial.total)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                {isOverdue ? (
                                                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                                                ) : (
                                                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                                                )}
                                                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                                                    {new Date(enr.financial.next_due).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatCurrency(enr.financial.next_amount)}
                                            </span>
                                            {isOverdue && <span className="text-[10px] text-red-600 font-bold uppercase">Overdue</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/app/enrollments/${enr.id}`}>View Profile</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Edit Cycle</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-green-600">
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Quick Pay
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
