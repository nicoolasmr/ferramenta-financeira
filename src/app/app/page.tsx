"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Plug, FolderKanban } from "lucide-react";
import { getDashboardMetrics } from "@/actions/dashboard";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import Link from "next/link";

interface DashboardMetrics {
    projectsCount: number;
    customersCount: number;
    integrationsCount: number;
    recentProjects: Array<{
        id: string;
        name: string;
        status: string;
        created_at: string;
    }>;
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDashboardMetrics("org-1")
            .then(setMetrics)
            .catch((err) => {
                console.error("Error loading dashboard:", err);
                setError("Failed to load dashboard data");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} retry={() => window.location.reload()} />;
    if (!metrics) return null;

    const kpis = [
        {
            title: "Total Projects",
            value: metrics.projectsCount,
            icon: FolderKanban,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Customers",
            value: metrics.customersCount,
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Active Integrations",
            value: metrics.integrationsCount,
            icon: Plug,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Total Revenue",
            value: "R$ 0",
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's your overview.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {kpi.title}
                                </CardTitle>
                                <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {metrics.recentProjects.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">
                            No projects yet. <Link href="/app/projects" className="text-blue-600 hover:underline">Create your first project</Link>
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {metrics.recentProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{project.name}</p>
                                        <p className="text-sm text-slate-500">
                                            Created {new Date(project.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${project.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {project.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
