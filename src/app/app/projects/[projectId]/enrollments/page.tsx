"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const enrollments = [
    {
        id: "enr_1",
        customer: { name: "Alice Smith", email: "alice@example.com", image: "" },
        status: "Active",
        cycle: "Jan 2026 - Jun 2026",
        financial: { status: "Ok", paid: "R$ 5.000", total: "R$ 10.000" }
    },
    {
        id: "enr_2",
        customer: { name: "Bob Jones", email: "bob@example.com", image: "" },
        status: "Onboarding",
        cycle: "Feb 2026 - Jul 2026",
        financial: { status: "Pending Entry", paid: "R$ 0", total: "R$ 12.000" }
    },
    {
        id: "enr_3",
        customer: { name: "Charlie Brown", email: "charlie@example.com", image: "" },
        status: "Active",
        cycle: "Jan 2026 - Jun 2026",
        financial: { status: "Overdue", paid: "R$ 2.000", total: "R$ 10.000" }
    }
];

export default function ProjectEnrollmentsPage() {
    const params = useParams();
    // const projectId = params.projectId;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Enrollments</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Enrollment
                </Button>
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
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cycle</TableHead>
                            <TableHead>Financial</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrollments.map((enr) => (
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
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={enr.status === 'Active' ? 'default' : 'secondary'}>{enr.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm">{enr.cycle}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant={enr.financial.status === 'Overdue' ? 'destructive' : 'outline'} className="w-fit">
                                            {enr.financial.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {enr.financial.paid} / {enr.financial.total}
                                        </span>
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
