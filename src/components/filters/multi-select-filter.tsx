'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectFilterProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

export function MultiSelectFilter({
    options,
    value,
    onChange,
    placeholder = 'Select options...'
}: MultiSelectFilterProps) {
    const [open, setOpen] = useState(false);

    const handleToggle = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const handleSelectAll = () => {
        onChange(options.map(opt => opt.value));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                            {value.slice(0, 2).map(v => {
                                const option = options.find(opt => opt.value === v);
                                return (
                                    <Badge key={v} variant="secondary" className="mr-1">
                                        {option?.label}
                                    </Badge>
                                );
                            })}
                            {value.length > 2 && (
                                <Badge variant="secondary">+{value.length - 2} more</Badge>
                            )}
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No option found.</CommandEmpty>
                    <CommandGroup>
                        <div className="flex gap-2 p-2 border-b">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="flex-1"
                            >
                                Select all
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearAll}
                                className="flex-1"
                            >
                                Clear all
                            </Button>
                        </div>
                        {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => handleToggle(option.value)}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
