
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, HelpCircle } from "lucide-react";
import { getDecisionActions } from "@/actions/consistency";
import { useWhy } from "@/components/consistency/WhyProvider";

export function TopAnomaliesBlock({ orgId }: { orgId: string }) {
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { inspect } = useWhy();

    useEffect(() => {
        getDecisionActions(orgId).then(setActions).finally(() => setLoading(false));
    }, [orgId]);

    if (loading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />;

    return (
        <Card className="glass dark:glass-dark border-red-200 dark:border-red-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertOctagon className="h-5 w-5 text-red-500" />
                    Top Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {actions.map((action, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-red-700 dark:text-red-400">{action.title}</h4>
                                <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-1">{action.description}</p>
                            </div>
                            <button
                                onClick={() => inspect('anomaly', action.project_id)}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-white dark:bg-black/20 text-red-500 hover:bg-red-100 transition-colors"
                            >
                                <HelpCircle className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {actions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <span className="text-xs">No critical actions pending.</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
