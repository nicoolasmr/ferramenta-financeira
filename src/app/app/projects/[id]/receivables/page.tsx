
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ReceivablesPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const projectId = resolvedParams.id;

    // Fetch Aging Summary
    const { data: aging } = await supabase
        .from('receivables_aging_view')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

    // Fetch List (Top 20 Overdue) - Ideally a separate component with pagination
    // Using simple query on installments domain table (via projects join if needed, or directly)
    // Wait, we need to join strict path.
    // 'installments' -> 'payment_plans' -> 'enrollments' -> 'project_id' (Legacy)
    // OR 'installments' -> 'payment' -> 'order' (Canonical)
    // Since we are hybrid, let's try the Legacy logic for lists first as that has data?
    // Actually, migration 20260310 added provider columns to installments.
    // Let's assume we query installments linked to project_id OR via joins.
    // For SAFETY in MVP: Query via JOIN as we might not have updated all rows with project_id shortcut.

    // Simplification: query via Join.
    /*
        SELECT i.*, c.name as customer_name
        FROM installments i
        JOIN payment_plans pp ON i.plan_id = pp.id
        JOIN enrollments e ON pp.enrollment_id = e.id
        JOIN customers c ON e.customer_id = c.id
        WHERE e.project_id = ? AND i.status = 'overdue'
        ORDER BY i.amount_cents DESC LIMIT 20
    */

    // Supabase JS syntax:
    const { data: overdueList } = await supabase
        .from('installments')
        .select(`
            *,
            payment_plans!inner (
                enrollments!inner (
                    project_id,
                    customers (name, email)
                )
            )
        `)
        .eq('payment_plans.enrollments.project_id', projectId)
        .eq('status', 'overdue')
        .order('amount_cents', { ascending: false })
        .limit(20);

    return (
        <div className="space-y-6 container mx-auto py-8">
            <h1 className="text-3xl font-bold tracking-tight">Receivables & Aging</h1>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Overdue 30d</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{formatCurrency((aging?.overdue_30 || 0) / 100)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Overdue 60d</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{formatCurrency((aging?.overdue_60 || 0) / 100)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Overdue 90d+</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency((aging?.overdue_90plus || 0) / 100)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Future</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{formatCurrency((aging?.future_receivables || 0) / 100)}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Overdue Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueList?.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.payment_plans.enrollments.customers.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.payment_plans.enrollments.customers.email}</div>
                                    </TableCell>
                                    <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{formatCurrency(item.amount_cents / 100)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Renegotiate</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
