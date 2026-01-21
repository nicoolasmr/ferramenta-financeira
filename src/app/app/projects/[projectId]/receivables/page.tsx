
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, MessageCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default async function ReceivablesPage({ params }: { params: { projectId: string } }) {
    const supabase = await createClient();
    const { projectId } = params;

    // 1. Fetch Aging Metrics (Real View)
    // We filter by org_id in the view, but here we might need filtering by project_id if the view supports it.
    // The view definition: GROUP BY org_id, project_id. So we can filter by project_id.
    const { data: agingHelper } = await supabase
        .from("receivables_aging_view")
        .select("*")
        .eq("project_id", projectId)
        .single();

    // Default zero if no data
    const aging = agingHelper || { overdue_30: 0, overdue_60: 0, overdue_90_plus: 0 };

    // 2. Fetch Overdue List (Real Table)
    // Join with enrollments to get customer info if possible
    const { data: overdueItems } = await supabase
        .from("installments")
        .select(`
            id,
            amount_cents,
            due_date,
            status,
            installment_number,
            enrollments (
                id,
                customer_email,
                customer_name
            )
        `)
        .eq("project_id", projectId)
        .eq("status", "overdue")
        .order("due_date", { ascending: true })
        .limit(50);

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Receivables & Collections</h1>
                <p className="text-muted-foreground">Manage overdue payments and recover revenue.</p>
            </div>

            {/* Aging Buckets */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue 1-30 Days</CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Action Required</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(aging.overdue_30)}</div>
                        <p className="text-xs text-muted-foreground">Recent defaults. Send "Friendly Reminder".</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue 31-60 Days</CardTitle>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">At Risk</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(aging.overdue_60)}</div>
                        <p className="text-xs text-muted-foreground">Persisting. Send "Overdue Notice".</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue 90+ Days</CardTitle>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(aging.overdue_90_plus)}</div>
                        <p className="text-xs text-muted-foreground">Severe. Consider renegotiation or suspension.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actionable List */}
            <Card>
                <CardHeader>
                    <CardTitle>Priority Collection List</CardTitle>
                    <CardDescription>
                        Students with overdue payments sorted by urgency.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Installment</TableHead>
                                <TableHead className="text-right">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueItems?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.enrollments?.customer_name || "Unknown Customer"}</span>
                                            <span className="text-xs text-muted-foreground">{item.enrollments?.customer_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-red-600 font-medium">
                                            <AlertCircle className="w-4 h-4" />
                                            {new Date(item.due_date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(item.amount_cents)}</TableCell>
                                    <TableCell>#{item.installment_number}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                WhatsApp
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                                <FileText className="w-3.5 h-3.5" />
                                                Email
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!overdueItems || overdueItems.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No overdue payments found. Great job!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
