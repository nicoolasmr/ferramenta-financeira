import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, DollarSign, Users, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function ClientPortalPage(props: { params: Promise<{ projectId: string }> }) {
    const params = await props.params;
    const projectId = params.projectId;
    const supabase = await createClient();

    // 1. Fetch Project & Settings (RLS applies)
    const { data: project, error: projError } = await supabase
        .from("projects")
        .select("name, settings")
        .eq("id", projectId)
        .single();

    if (projError || !project) {
        // RLS hidden or invalid ID
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Lock className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-xl font-bold">Resricted Access</h1>
                <p>You do not have permission to view this portal.</p>
                <Button asChild><a href="/auth/login">Login</a></Button>
            </div>
        );
    }

    const maskPII = project.settings?.mask_pii;

    // 2. Fetch Financial Stats (from View)
    const { data: stats } = await supabase
        .from("project_financials_view")
        .select("*")
        .eq("project_id", projectId)
        .single();

    // Fallbacks if view empty (e.g. no enrollments yet)
    const sales = stats?.total_sold || 0;
    const received = stats?.total_received || 0;
    const collectedPct = sales > 0 ? Math.round((received / sales) * 100) : 0;

    // 3. Fetch Students (RLS applies)
    // We need calculation for "Paid %" and "At Risk".
    // For MVP portal, let's fetch enrollments with Plans -> Installments.
    const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
            id,
            status,
            customer:customers(name, email),
            payment_plans(
                id,
                total_amount_cents,
                installments(status, amount_cents)
            )
        `)
        .eq("project_id", projectId);

    type Installment = {
        status: string;
        amount_cents: number;
    };

    type PaymentPlan = {
        id: string;
        total_amount_cents: number;
        installments: Installment[];
    };

    type Enrollment = {
        id: string;
        status: string;
        customer?: { name?: string; email?: string };
        payment_plans?: PaymentPlan[];
    };

    const typedEnrollments = (enrollments || []) as Enrollment[];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">{project.name}</h1>
                        <p className="text-xs text-muted-foreground">Client Portal (Secure)</p>
                    </div>
                </div>
                <Button variant="ghost" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Read Only
                </Button>
            </header>

            <main className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sales / 100)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Received</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(received / 100)}
                            </div>
                            <p className="text-xs text-muted-foreground">{collectedPct}% collected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Students</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{typedEnrollments.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Students List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Students Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {typedEnrollments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No students enrolled.</p>
                            ) : typedEnrollments.map((enr) => {
                                // Calculate Paid %
                                const plan = enr.payment_plans?.[0];
                                const total = plan?.total_amount_cents || 0;
                                const paid = plan?.installments
                                    ?.filter((i) => i.status === 'paid')
                                    .reduce((acc, cur) => acc + cur.amount_cents, 0) || 0;
                                const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
                                const hasOverdue = plan?.installments?.some((i) => i.status === 'overdue');

                                // Masking PII
                                const displayName = maskPII
                                    ? `${enr.customer?.name?.charAt(0)}. (Redacted)`
                                    : enr.customer?.name || "Unknown";

                                return (
                                    <div key={enr.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">{displayName}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{enr.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm font-medium">{percent}% Paid</div>
                                            {hasOverdue && <Badge variant="destructive">Late Payment</Badge>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
