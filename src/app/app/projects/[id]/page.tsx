
import { createClient } from "@/lib/supabase/server";
import { BelvoDashboardBlock } from "@/components/dashboard/BelvoDashboardBlock";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProjectDashboardPage({ params }: { params: { id: string } }) {
    const projectId = params.id;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    if (!project) notFound();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/app/projects">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide">Project Dashboard</p>
                </div>
            </div>

            <BelvoDashboardBlock orgId={project.org_id} projectId={project.id} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href={`/app/projects/${projectId}/cash`} className="text-sm text-blue-600 hover:underline">
                            Caixa Real
                        </Link>
                        <Link href={`/app/projects/${projectId}/integrations`} className="text-sm text-blue-600 hover:underline">
                            Integrations
                        </Link>
                        <Link href={`/app/projects/${projectId}/collections`} className="text-sm text-blue-600 hover:underline">
                            Collections
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
