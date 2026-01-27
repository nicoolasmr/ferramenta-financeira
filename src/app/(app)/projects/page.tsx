'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { Rocket, Settings, Key, MoreVertical } from 'lucide-react';
import Link from 'next/link';

// Mock data
const MOCK_PROJECTS = [
    {
        id: '1',
        name: 'Production',
        slug: 'production',
        environment: 'production' as const,
        region: 'gru1' as const,
        created_at: '2026-01-15',
    },
    {
        id: '2',
        name: 'Staging',
        slug: 'staging',
        environment: 'staging' as const,
        region: 'gru1' as const,
        created_at: '2026-01-18',
    },
    {
        id: '3',
        name: 'Development',
        slug: 'development',
        environment: 'development' as const,
        region: 'us-east-1' as const,
        created_at: '2026-01-20',
    },
];

const ENV_COLORS = {
    production: 'bg-emerald-100 text-emerald-700',
    staging: 'bg-amber-100 text-amber-700',
    development: 'bg-blue-100 text-blue-700',
};

const REGION_LABELS = {
    'gru1': 'São Paulo, BR',
    'us-east-1': 'N. Virginia, US',
};

export default function ProjectsPage() {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Rocket className="w-8 h-8" />
                        Projetos
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Gerencie seus projetos e ambientes isolados.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Criar Projeto
                </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PROJECTS.map((project) => (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{project.name}</CardTitle>
                                    <CardDescription className="mt-1">
                                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                                            {project.slug}
                                        </code>
                                    </CardDescription>
                                </div>
                                <Badge className={ENV_COLORS[project.environment]}>
                                    {project.environment}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-slate-600">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-500">Região:</span>
                                    <span className="font-medium">{REGION_LABELS[project.region]}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Criado em:</span>
                                    <span className="font-medium">
                                        {new Date(project.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t">
                                <Link href={`/app/projects/${project.id}/api-keys`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Key className="w-4 h-4 mr-2" />
                                        API Keys
                                    </Button>
                                </Link>
                                <Link href={`/app/projects/${project.id}/settings`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {MOCK_PROJECTS.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <Rocket className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
                        <p className="text-slate-600 mb-6">
                            Crie seu primeiro projeto para começar a usar o RevenueOS.
                        </p>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Rocket className="w-4 h-4 mr-2" />
                            Criar Primeiro Projeto
                        </Button>
                    </CardContent>
                </Card>
            )}

            <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
    );
}
