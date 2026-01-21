
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { getActionMetadata } from "@/lib/copilot/planner";
import Link from "next/link";
import { runCopilotForOrg } from "@/lib/copilot/scheduler";
import { revalidatePath } from "next/cache";

async function refreshProjectCopilot(formData: FormData) {
    "use server";
    // For now we run org-wide, can optimize to run project-specific if needed
    const orgId = formData.get("orgId") as string;
    await runCopilotForOrg(orgId);
    revalidatePath(`/app/projects/${formData.get("projectId")}/copilot`);
}

export default async function ProjectCopilotPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const supabase = await createClient();

    // Fetch Project Context
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) return <div>Project Not Found</div>;

    // Fetch Insights & Actions for this Project
    const { data: insights } = await supabase
        .from('insights')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

    const { data: actions } = await supabase
        .from('actions_queue')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'open')
        .order('priority', { ascending: false })
        .limit(3);

    const scoreInsight = insights?.find(i => i.title.startsWith("Project Health"));
    const score = scoreInsight?.evidence_json?.score ?? 100;
    const breakdown = scoreInsight?.evidence_json?.breakdown ?? [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Copilot: {project.name}</h1>
                    <p className="text-muted-foreground">Deep dive analysis.</p>
                </div>
                <form action={refreshProjectCopilot}>
                    <input type="hidden" name="orgId" value={project.org_id} />
                    <input type="hidden" name="projectId" value={projectId} />
                    <Button variant="outline" type="submit">Recalculate</Button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Score Card */}
                <Card className="col-span-1 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Health Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className={`text-6xl font-bold ${score < 50 ? "text-red-500" : (score < 80 ? "text-amber-500" : "text-green-500")}`}>
                                {score}
                            </div>
                            <div className="space-y-1">
                                <Badge variant={score < 50 ? "destructive" : (score < 80 ? "secondary" : "default")}>
                                    {score < 50 ? "Critical" : (score < 80 ? "Attention" : "Healthy")}
                                </Badge>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <p className="text-sm font-medium">Factor Analysis:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                                {breakdown.length > 0 ? breakdown.map((b: string, i: number) => (
                                    <li key={i}>{b}</li>
                                )) : (
                                    <li>System Baseline (+100)</li>
                                )}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Plan */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recommended Actions</CardTitle>
                        <CardDescription>Tailored for {project.name}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {actions?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No specific actions for this project.
                            </div>
                        ) : (
                            actions?.map((action) => {
                                const meta = getActionMetadata(action.action_type as any, action.payload_json);
                                return (
                                    <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                        <div>
                                            <h4 className="font-semibold">{meta.label}</h4>
                                            <p className="text-xs text-muted-foreground">Priority: {action.priority}</p>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href={meta.link}>
                                                Do it <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Insights List */}
                <Card className="col-span-full">
                    <CardHeader>
                        <CardTitle>Project Ledger</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {insights?.filter(i => !i.title.startsWith("Project Health")).map((insight) => (
                            <div key={insight.id} className="border-l-4 pl-4 py-2 space-y-1" style={{ borderColor: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                                    <span className="text-[10px] text-muted-foreground">{new Date(insight.created_at!).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{insight.summary}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
