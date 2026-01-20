"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock Data
const projects = [
    {
        id: "proj_1",
        name: "Mentoria Q1 2026",
        client: "Acme Corp",
        students: 12,
        startDate: "2026-01-01",
        status: "active"
    },
    {
        id: "proj_2",
        name: "Curso Online - Lançamento Fev",
        client: "Personal Brand",
        students: 45,
        startDate: "2026-02-15",
        status: "planning"
    },
    {
        id: "proj_3",
        name: "Consultoria Enterprise",
        client: "TechGiant Inc",
        students: 5,
        startDate: "2025-11-01",
        status: "active"
    }
];

export default function ProjectsListPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your mentorships, courses, and services.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-all cursor-pointer group">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
                                    <CardDescription>{project.client}</CardDescription>
                                </div>
                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                    {project.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{project.students} enrollments</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Starts {project.startDate}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href={`/app/projects/${project.id}/dashboard`} className="w-full">
                                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                    View Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
