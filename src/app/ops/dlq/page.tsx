import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default async function DLQPage() {
    const supabase = await createClient();
    const { data: events } = await supabase.from("dead_letter_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dead Letter Queue</h1>
            <p className="text-muted-foreground">Events that failed processing permanently.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Failed Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {(!events || events.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            <AlertCircle className="h-10 w-10 mb-4 opacity-50" />
                            <p>No dead letters found. System is healthy.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event: any) => (
                                <div key={event.id} className="flex items-start justify-between p-4 border rounded-md">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="destructive">{event.provider}</Badge>
                                            <span className="font-mono text-sm">{event.external_event_id}</span>
                                        </div>
                                        <p className="text-sm font-medium">Reason: {event.reason}</p>
                                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto max-w-xl">
                                            {JSON.stringify(event.payload_dump, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(event.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
