
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function TransactionsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const projectId = params.id;

    // Fetch Orders (Sales)
    // Ideally we assume 'orders' table.
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(50);

    return (
        <div className="space-y-6 container mx-auto py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ledger</h1>
                    <p className="text-muted-foreground">Unified view of all financial events.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A list of verified sales and subscriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!orders || orders.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{formatDate(order.updated_at)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Order</Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{order.provider}</TableCell>
                                    <TableCell>{order.customer_email || "Unknown"}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(order.gross_amount_cents / 100)}
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
