
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { getPortfolioHealth } from "@/actions/consistency";
import { useWhy } from "@/components/consistency/WhyProvider";

export function PortfolioHealthBlock({ orgId }: { orgId: string }) {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { inspect } = useWhy();

    useEffect(() => {
        getPortfolioHealth(orgId).then(setProjects).finally(() => setLoading(false));
    }, [orgId]);

    if (loading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />;

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
        if (score >= 70) return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
    };

    return (
        <Card className="glass dark:glass-dark">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">Portfolio Health</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                        <div key={project.project_id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-all">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{project.project_name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${getScoreColor(project.health_score)}`}>
                                        Score: {project.health_score}
                                    </span>
                                    {project.critical_anomalies > 0 && (
                                        <Badge variant="destructive" className="h-5 text-[10px]">
                                            {project.critical_anomalies} Issues
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => inspect('project', project.project_id)}
                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <ShieldCheck className="h-8 w-8 mb-2 opacity-50" />
                            <span className="text-xs">No projects or anomalies found.</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
