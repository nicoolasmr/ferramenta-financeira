"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, CheckCircle, AlertCircle, Clock, MoreVertical, DollarSign, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EnrollmentProfilePage() {
    const params = useParams();
    const enrollmentId = params.enrollmentId as string;

    // Mock Data
    const enrollment = {
        id: enrollmentId,
        customer: "Alice Smith",
        project: "Mentoria Q1 2026",
        status: "Active",
        financial: { total: "R$ 10.000,00", paid: "R$ 5.000,00", open: "R$ 5.000,00", overdue: "R$ 0,00" },
        installments: [
            { number: 1, amount: "R$ 5.000,00", due: "2026-01-01", status: "paid", paidAt: "2026-01-01" },
            { number: 2, amount: "R$ 1.000,00", due: "2026-02-01", status: "pending", paidAt: null },
            { number: 3, amount: "R$ 1.000,00", due: "2026-03-01", status: "pending", paidAt: null },
        ]
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/app/projects/proj_1/enrollments`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{enrollment.customer}</h1>
                        <Badge>{enrollment.status}</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{enrollment.project}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit Cycle</Button>
                    <Button>Log Interaction</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {/* Sidebar Info */}
                <Card className="col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase text-muted-foreground">Cycle Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">Jan 01, 2026</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">End Date</p>
                            <p className="font-medium">Jun 30, 2026</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Niche</p>
                            <p className="font-medium">Health & Fitness</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground mb-1">Contract</p>
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Signed</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Jan 01, 2026</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <Tabs defaultValue="financials">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="financials">Financials</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4 space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Diagnosis</CardTitle></CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground">Initial notes about the customer goals...</p></CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="financials" className="mt-4 space-y-6">
                            {/* Financial Summary Cards */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
                                        <p className="text-xl font-bold">{enrollment.financial.total}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-xs text-muted-foreground uppercase font-bold text-green-600">Paid</p>
                                        <p className="text-xl font-bold text-green-600">{enrollment.financial.paid}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Open</p>
                                        <p className="text-xl font-bold">{enrollment.financial.open}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4">
                                        <p className="text-xs text-muted-foreground uppercase font-bold text-red-600">Overdue</p>
                                        <p className="text-xl font-bold text-red-600">{enrollment.financial.overdue}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Installments Table */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Plan & Installments</CardTitle>
                                    <Button variant="outline" size="sm">Add Installment</Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {enrollment.installments.map((inst) => (
                                            <div key={inst.number} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${inst.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {inst.number}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{inst.amount}</p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" /> Due {inst.due}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {inst.status === 'paid' ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Paid {inst.paidAt}</Badge>
                                                    ) : inst.status === 'overdue' ? (
                                                        <Badge variant="destructive">Overdue</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Pending</Badge>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {inst.status !== 'paid' && (
                                                                <DropdownMenuItem className="text-green-600 cursor-pointer">
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem>
                                                                <CalendarDays className="mr-2 h-4 w-4" /> Change Due Date
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-orange-600 cursor-pointer">
                                                                <DollarSign className="mr-2 h-4 w-4" /> Renegotiate
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-4">
                            <Card>
                                <CardHeader><CardTitle>Contract & Files</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                                        <FileText className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="font-medium">Contract_Signed.pdf</p>
                                            <p className="text-xs text-muted-foreground">Uploaded Jan 01, 2026</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="ml-auto">Download</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
