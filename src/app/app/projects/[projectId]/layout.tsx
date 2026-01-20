"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Users, LayoutDashboard, Share2, ShoppingCart, Settings2, Sparkles } from "lucide-react";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const params = useParams();
    const projectId = params.projectId as string;

    const tabs = [
        { name: "Dashboard", href: `/app/projects/${projectId}/dashboard`, icon: LayoutDashboard },
        { name: "Enrollments", href: `/app/projects/${projectId}/enrollments`, icon: Users },
        { name: "Orders", href: `/app/projects/${projectId}/orders`, icon: ShoppingCart },
        { name: "Integrations", href: `/app/projects/${projectId}/integrations`, icon: Settings2 },
        { name: "AI Analyst", href: `/app/projects/${projectId}/ai`, icon: Sparkles },
        { name: "Settings", href: `/app/projects/${projectId}/settings`, icon: Settings },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/app/projects">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Mentoria Q1 2026</h1>
                            <p className="text-sm text-muted-foreground">Project ID: {projectId}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Client Portal
                        </Button>
                        <Button size="sm">Add Student</Button>
                    </div>
                </div>

                <div className="border-b">
                    <nav className="flex gap-4" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        "flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                                        isActive
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground"
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {children}
        </div>
    );
}
