
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function ReconciliationPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const projectId = params.id;

    const { data: recon } = await supabase
        .from('reconciliation_summary_view')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle(); // Use maybeSingle to avoid 406 if no rows

    const expected = recon?.expected_revenue || 0;
    const received = recon?.gateway_received || 0;
    const payouts = recon?.gateway_payouts || 0;
    const bank = recon?.bank_received_total || 0;

    const gap = expected - received;
    const payoutGap = received - payouts; // Money held by gateway or fees
    // This is naive. Payouts are Net. Received is Gross (usually). So gap is fees + held.

    return (
        <div className="space-y-6 container mx-auto py-8">
            <h1 className="text-3xl font-bold tracking-tight">Reconciliation</h1>
            <p className="text-muted-foreground">Compare Expected Revenue vs Gateway Settlements vs Bank Deposits.</p>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Expected (Orders)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(expected / 100)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Received (Gateway)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(received / 100)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Pending Settlement: {formatCurrency(Math.max(0, payoutGap) / 100)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bank (Cash Real)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(bank / 100)}</div>
                    </CardContent>
                </Card>
            </div>

            {Math.abs(gap) > 100 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Revenue Gap Detected</AlertTitle>
                    <AlertDescription>
                        There is a difference of {formatCurrency(gap / 100)} between confirmed orders and gateway payments.
                        This may indicate failed captures, manual processings, or data sync issues.
                    </AlertDescription>
                </Alert>
            )}

            {Math.abs(gap) <= 100 && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Reconciled</AlertTitle>
                    <AlertDescription>Orders and Gateway payments match perfectly.</AlertDescription>
                </Alert>
            )}

        </div>
    );
}
