'use client';

import { useState, useEffect } from 'react';
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
import { useOrganization } from '@/components/providers/OrganizationProvider';
import { getProjects, type Project } from '@/actions/projects';

const ENV_COLORS = {
    production: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    staging: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    development: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

interface ProjectSwitcherProps {
    className?: string;
    onCreateProject?: () => void;
}

export function ProjectSwitcher({ className, onCreateProject }: ProjectSwitcherProps) {
    const { activeOrganization } = useOrganization();
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        if (!activeOrganization) return;
        getProjects(activeOrganization.id)
            .then(data => {
                setProjects(data);
                if (data.length > 0 && !selectedProject) {
                    setSelectedProject(data[0]);
                }
            });
    }, [activeOrganization]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={!selectedProject}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Rocket className="w-4 h-4 text-slate-500" />
                        <span className="truncate font-medium">
                            {selectedProject ? selectedProject.name : 'Selecionar Projeto'}
                        </span>
                        {selectedProject && (
                            <Badge className={cn('text-xs', ENV_COLORS[selectedProject.environment])}>
                                {selectedProject.environment}
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
                <Command>
                    <CommandInput placeholder="Buscar projeto..." />
                    <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                    <CommandGroup heading="Seus Projetos">
                        {projects.map((project) => (
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
                                        selectedProject?.id === project.id ? 'opacity-100' : 'opacity-0'
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
