
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Mail, MessageSquare, Clock } from "lucide-react";

export default function DunningPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from('dunning_rules')
                .select(`
                    *,
                    template:dunning_templates(name)
                `)
                .eq('project_id', projectId)
                .order('days_after_due', { ascending: true });
            setRules(data || []);
            setLoading(false);
        }
        load();
    }, [projectId]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dunning Automation</h1>
                    <p className="text-muted-foreground">Recover lost revenue with automated follow-ups.</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" /> New Rule
                </Button>
            </div>

            <div className="grid gap-4">
                {rules.length === 0 && !loading && (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No rules configured. Start by creating a "+3 Days" email rule.
                        </CardContent>
                    </Card>
                )}

                {rules.map(rule => (
                    <Card key={rule.id} className="relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-slate-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-700">
                                        {rule.days_after_due > 0 ? `+${rule.days_after_due}` : rule.days_after_due}d
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{rule.template?.name || "Unnamed Template"}</h3>
                                        <Badge variant="outline" className="uppercase text-[10px]">
                                            {rule.channel}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Triggered {rule.days_after_due} days after due date.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Active</span>
                                    <Switch checked={rule.active} />
                                </div>
                                <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Example of what it enables */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Recovered this Month</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold text-emerald-600">R$ 0,00</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Messages Sent</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">0</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Open Rate</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">0%</p></CardContent>
                </Card>
            </div>
        </div>
    );
}
