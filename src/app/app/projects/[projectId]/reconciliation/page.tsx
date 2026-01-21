
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default async function ReconciliationPage({ params }: { params: { projectId: string } }) {
    const supabase = await createClient();
    const { projectId } = params;

    // Fetch the project to get the org_id (assuming simple ownership for now)
    // In a real app we might get org_id from the session or context
    const { data: project } = await supabase.from("projects").select("org_id").eq("id", projectId).single();

    if (!project) return <div>Project not found</div>;

    // Fetch Reconciliation Data
    const { data: summary } = await supabase
        .from("reconciliation_summary_view")
        .select("*")
        .eq("org_id", project.org_id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Reconciliation</h1>
                    <p className="text-muted-foreground">Verify the integrity of your financial data across providers.</p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Sync Job
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summary?.map((item) => (
                    <Card key={item.provider}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">
                                {item.provider}
                            </CardTitle>
                            {item.conversion_rate >= 99 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.conversion_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Conversion Rate (Normalized / Raw)
                            </p>

                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Raw Events:</span>
                                    <span className="font-medium">{item.total_raw}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Normalized:</span>
                                    <span className="font-medium">{item.total_normalized}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Gap (Delta):</span>
                                    <Badge variant={item.delta_count === 0 ? "outline" : "destructive"}>
                                        {item.delta_count}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!summary || summary.length === 0) && (
                    <div className="col-span-full text-center p-8 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No reconciliation data found for this organization.</p>
                        <Button variant="link">Configure Integrations</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
