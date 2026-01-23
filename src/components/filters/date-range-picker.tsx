'use client';

import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateRange {
    from: Date;
    to: Date;
    preset?: 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}

interface DateRangePickerProps {
    value?: DateRange;
    onChange: (range?: DateRange) => void;
}

const PRESETS = {
    today: {
        label: 'Today',
        getRange: () => ({
            from: startOfDay(new Date()),
            to: endOfDay(new Date()),
            preset: 'today' as const
        })
    },
    last7days: {
        label: 'Last 7 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 7)),
            to: endOfDay(new Date()),
            preset: 'last7days' as const
        })
    },
    last30days: {
        label: 'Last 30 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 30)),
            to: endOfDay(new Date()),
            preset: 'last30days' as const
        })
    },
    thisMonth: {
        label: 'This month',
        getRange: () => ({
            from: startOfMonth(new Date()),
            to: endOfMonth(new Date()),
            preset: 'thisMonth' as const
        })
    },
    lastMonth: {
        label: 'Last month',
        getRange: () => {
            const lastMonth = subDays(startOfMonth(new Date()), 1);
            return {
                from: startOfMonth(lastMonth),
                to: endOfMonth(lastMonth),
                preset: 'lastMonth' as const
            };
        }
    }
};

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handlePresetChange = (preset: string) => {
        if (preset === 'custom') {
            onChange({
                from: startOfDay(new Date()),
                to: endOfDay(new Date()),
                preset: 'custom'
            });
        } else {
            onChange(PRESETS[preset as keyof typeof PRESETS].getRange());
        }
    };

    const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range?.from && range?.to) {
            onChange({
                from: startOfDay(range.from),
                to: endOfDay(range.to),
                preset: 'custom'
            });
            setIsOpen(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Select
                value={value?.preset || ''}
                onValueChange={handlePresetChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(PRESETS).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>
                            {label}
                        </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
            </Select>

            {value?.preset === 'custom' && (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'justify-start text-left font-normal',
                                !value && 'text-muted-foreground'
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value?.from && value?.to ? (
                                <>
                                    {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                                </>
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={value?.from}
                            selected={{ from: value?.from, to: value?.to }}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            )}

            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange(undefined)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
