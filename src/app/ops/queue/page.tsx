
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function QueueOpsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("queued");
    const supabase = createClient();

    const fetchJobs = async () => {
        setLoading(true);
        let query = supabase.from('jobs_queue').select('*').order('created_at', { ascending: false }).limit(50);

        if (activeTab === 'dead') {
            query = query.eq('status', 'dead');
        } else if (activeTab === 'failed') {
            // Failed implies retrying usually, which is status 'queued' but attempts > 0
            // Or we just show running/completed?
            // Let's filter client side or simplistic.
            // Ops view usually wants "Dead" separate.
            query = query;
        }

        const { data } = await query;
        setJobs(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchJobs();
    }, [activeTab]);

    const handleRequeue = async (jobId: string) => {
        const { error } = await supabase.from('jobs_queue').update({
            status: 'queued',
            attempts: 0,
            available_at: new Date().toISOString(),
            last_error: null
        }).eq('id', jobId);

        if (error) toast.error("Failed to requeue");
        else {
            toast.success("Job requeued!");
            fetchJobs();
        }
    };

    const filteredJobs = jobs.filter(j => activeTab === 'all' || j.status === activeTab || (activeTab === 'failed' && j.status === 'dead'));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black">Queue Operations</h1>
                <Button variant="outline" onClick={fetchJobs}><RefreshCcw className="h-4 w-4" /></Button>
            </div>

            <Tabs defaultValue="queued" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="queued">Queued / Running</TabsTrigger>
                    <TabsTrigger value="dead">Dead Letters (DLQ)</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                {/* Shared List View */}
                <div className="mt-4 space-y-3">
                    {loading ? <Loader2 className="animate-spin h-8 w-8 mx-auto" /> : filteredJobs.map(job => (
                        <Card key={job.id} className="border-l-4" style={{ borderLeftColor: job.status === 'dead' ? 'red' : job.status === 'running' ? 'blue' : 'gray' }}>
                            <CardContent className="py-4 flex justify-between items-start">
                                <div>
                                    <div className="flex gap-2 items-center mb-1">
                                        <Badge variant="outline">{job.job_type}</Badge>
                                        <span className={`text-xs font-bold uppercase ${job.status === 'dead' ? 'text-red-500' : 'text-slate-500'}`}>{job.status}</span>
                                        {job.attempts > 0 && <span className="text-xs text-orange-500">Try #{job.attempts}</span>}
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground break-all">
                                        ID: {job.id} | Trace: {job.trace_id || 'N/A'}
                                    </div>
                                    {job.last_error && (
                                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded max-w-xl">
                                            {job.last_error}
                                        </div>
                                    )}
                                </div>
                                {job.status === 'dead' && (
                                    <Button size="sm" variant="secondary" onClick={() => handleRequeue(job.id)}>
                                        Requeue
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {!loading && filteredJobs.length === 0 && <p className="text-center text-muted-foreground p-8">No jobs found in this view.</p>}
                </div>
            </Tabs>
        </div>
    );
}
