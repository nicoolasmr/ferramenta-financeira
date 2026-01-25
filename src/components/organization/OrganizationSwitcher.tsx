'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganization } from "@/components/providers/OrganizationProvider";
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
import { cn } from '@/lib/utils';

// Mock data - replace with real data from API
const MOCK_ORGANIZATIONS = [
    { id: '1', name: 'Minha Empresa SaaS', role: 'owner' },
    { id: '2', name: 'Startup XYZ', role: 'admin' },
    { id: '3', name: 'Consultoria ABC', role: 'member' },
];

interface OrganizationSwitcherProps {
    className?: string;
}

export function OrganizationSwitcher({ className }: OrganizationSwitcherProps) {
    const { activeOrganization, setActiveOrganization } = useOrganization();
    const [open, setOpen] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);

    // Fetch organizations on mount
    useEffect(() => {
        async function loadOrgs() {
            try {
                const { getUserOrganizations } = await import("@/actions/organization");
                const orgs = await getUserOrganizations();
                setOrganizations(orgs);
            } catch (error) {
                console.error("Failed to load organizations", error);
            }
        }
        loadOrgs();
    }, []);

    const currentOrg = activeOrganization || (organizations.length > 0 ? organizations[0] : null);

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
                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {currentOrg?.name?.charAt(0) || "?"}
                        </div>
                        <span className="truncate">{currentOrg?.name || "Select Organization"}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search organization..." />
                    <CommandEmpty>No organization found.</CommandEmpty>
                    <CommandGroup heading="Your Organizations">
                        {organizations.map((org) => (
                            <CommandItem
                                key={org.id}
                                onSelect={() => {
                                    setActiveOrganization(org);
                                    setOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {org.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{org.name}</div>
                                        <div className="text-xs text-slate-500 capitalize">{org.role || 'Member'}</div>
                                    </div>
                                </div>
                                <Check
                                    className={cn(
                                        'ml-auto h-4 w-4',
                                        activeOrganization?.id === org.id ? 'opacity-100' : 'opacity-0'
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
                                window.location.href = '/app/onboarding';
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Organization
                        </Button>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
