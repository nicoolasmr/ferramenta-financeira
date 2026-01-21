
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Zap } from "lucide-react";
import { getActionMetadata } from "@/lib/copilot/planner";
import { runCopilotForOrg } from "@/lib/copilot/scheduler";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function refreshCopilot(formData: FormData) {
    "use server";
    const orgId = formData.get("orgId") as string;
    await runCopilotForOrg(orgId);
    revalidatePath("/app/copilot");
}

export default async function CopilotPortfolioPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get Org Context (Assuming First Org for MVP or derived from session)
    const { data: memberships } = await supabase.from('memberships').select('org_id').eq('user_id', user?.id).single();
    const orgId = memberships?.org_id;

    if (!orgId) return <div>No Organization Found</div>;

    // Fetch Insights & Actions
    const { data: insights } = await supabase
        .from('insights')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20);

    const { data: actions } = await supabase
        .from('actions_queue')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'open')
        .order('priority', { ascending: false })
        .limit(3);

    const criticalInsights = insights?.filter(i => i.severity === 'critical') || [];
    const recentScore = insights?.find(i => i.title.startsWith("Project Health"))?.evidence_json?.score ?? 100;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Copilot</h1>
                    <p className="text-muted-foreground">Your AI financial analyst.</p>
                </div>
                <form action={refreshCopilot}>
                    <input type="hidden" name="orgId" value={orgId} />
                    <Button variant="outline" type="submit">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recalculate Analysis
                    </Button>
                </form>
            </div>

            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className={recentScore < 50 ? "border-red-500 bg-red-50/10" : "bg-gradient-to-br from-white to-slate-50"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
                        <Activity className={recentScore < 50 ? "text-red-500" : "text-green-500"} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{recentScore}/100</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {recentScore > 80 ? "Your portfolio is performing well." : "Several risks detected requiring attention."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
                        <AlertTriangle className={criticalInsights.length > 0 ? "text-amber-500" : "text-muted-foreground"} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{criticalInsights.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Critical issues needing immediate action.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto-Plans</CardTitle>
                        <Zap className="text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{actions?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Actions queued for execution.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Proposed Actions */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top 3 Actions for Today</CardTitle>
                        <CardDescription>Prioritized by impact and urgency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {actions?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="mx-auto h-8 w-8 mb-2 text-green-500" />
                                All clear! No urgent actions.
                            </div>
                        ) : (
                            actions?.map((action) => {
                                const meta = getActionMetadata(action.action_type as any, action.payload_json);
                                return (
                                    <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                                {/* Icon placeholder logic or lucide import map needed if dynamic */}
                                                <Zap className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">{meta.label}</h4>
                                                <p className="text-xs text-muted-foreground capitalize">Priority: {action.priority}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={meta.link}>Review & Execute</Link>
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                        <Button variant="ghost" className="w-full mt-2" asChild>
                            <Link href="/app/copilot/actions">View Action Queue</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Insight Stream */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Intelligence Feed</CardTitle>
                        <CardDescription>Live analysis from the deterministic engine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                        {insights?.map((insight) => (
                            <div key={insight.id} className="border-l-4 pl-4 py-2 space-y-1" style={{ borderColor: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                                    <span className="text-[10px] text-muted-foreground">{new Date(insight.created_at!).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {insight.summary}
                                </p>
                                {/* GPT Expansion Button would go here */}
                                {insight.evidence_json && Object.keys(insight.evidence_json).length > 0 && (
                                    <div className="text-xs font-mono bg-slate-100 p-2 rounded mt-2">
                                        {JSON.stringify(insight.evidence_json).substring(0, 100)}...
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
