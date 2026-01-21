
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActionMetadata } from "@/lib/copilot/planner";
import Link from "next/link";
import { Check } from "lucide-react";

export default async function ActionsQueuePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get Org Context
    const { data: memberships } = await supabase.from('memberships').select('org_id').eq('user_id', user?.id).single();
    const orgId = memberships?.org_id;

    if (!orgId) return <div>No Organization Found</div>;

    const { data: actions } = await supabase
        .from('actions_queue')
        .select('*')
        .eq('org_id', orgId)
        .order('priority', { ascending: false })
        .limit(50);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Action Queue</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Pending Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {actions?.map((action) => {
                            const meta = getActionMetadata(action.action_type as any, action.payload_json);
                            return (
                                <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={action.status === 'done' ? 'default' : (action.priority > 80 ? 'destructive' : 'secondary')}>
                                                {action.status === 'open' ? (action.priority > 80 ? 'High Priority' : 'Normal') : 'Completed'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{action.action_type.replace('_', ' ')}</span>
                                        </div>
                                        <h4 className="font-semibold">{meta.label}</h4>
                                        <div className="text-xs text-muted-foreground mt-1 font-mono">
                                            Payload: {JSON.stringify(action.payload_json)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {action.status === 'open' && (
                                            <Button size="sm" asChild>
                                                <Link href={meta.link}>Execute</Link>
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" disabled={action.status === 'done'}>
                                            <Check className="w-4 h-4 mr-1" />
                                            {action.status === 'done' ? 'Resolved' : 'Mark Done'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
