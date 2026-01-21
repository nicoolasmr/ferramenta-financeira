'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data - replace with real data from API
const MOCK_PROJECTS = [
    { id: '1', name: 'Production', slug: 'production', environment: 'production' as const },
    { id: '2', name: 'Staging', slug: 'staging', environment: 'staging' as const },
    { id: '3', name: 'Development', slug: 'development', environment: 'development' as const },
];

const ENV_COLORS = {
    production: 'bg-emerald-100 text-emerald-700',
    staging: 'bg-amber-100 text-amber-700',
    development: 'bg-blue-100 text-blue-700',
};

interface ProjectSwitcherProps {
    className?: string;
    onCreateProject?: () => void;
}

export function ProjectSwitcher({ className, onCreateProject }: ProjectSwitcherProps) {
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Rocket className="w-4 h-4 text-slate-500" />
                        <span className="truncate font-medium">{selectedProject.name}</span>
                        <Badge className={cn('text-xs', ENV_COLORS[selectedProject.environment])}>
                            {selectedProject.environment}
                        </Badge>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
                <Command>
                    <CommandInput placeholder="Buscar projeto..." />
                    <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                    <CommandGroup heading="Seus Projetos">
                        {MOCK_PROJECTS.map((project) => (
                            <CommandItem
                                key={project.id}
                                onSelect={() => {
                                    setSelectedProject(project);
                                    setOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <Rocket className="w-4 h-4 text-slate-400" />
                                    <div className="flex-1">
                                        <div className="font-medium">{project.name}</div>
                                        <div className="text-xs text-slate-500">{project.slug}</div>
                                    </div>
                                    <Badge className={cn('text-xs', ENV_COLORS[project.environment])}>
                                        {project.environment}
                                    </Badge>
                                </div>
                                <Check
                                    className={cn(
                                        'ml-2 h-4 w-4',
                                        selectedProject.id === project.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <div className="border-t p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                                setOpen(false);
                                onCreateProject?.();
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Novo Projeto
                        </Button>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
