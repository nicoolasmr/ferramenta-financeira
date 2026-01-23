'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Filter, Save } from 'lucide-react';
import { DateRangePicker } from './date-range-picker';
import { MultiSelectFilter } from './multi-select-filter';
import { NumericRangeFilter } from './numeric-range-filter';
import type { FilterState, FilterConfig } from './types';

interface FilterBuilderProps {
    config: FilterConfig;
    value: FilterState;
    onChange: (filters: FilterState) => void;
    onSavePreset?: () => void;
}

export function FilterBuilder({
    config,
    value,
    onChange,
    onSavePreset
}: FilterBuilderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClearAll = () => {
        onChange({});
    };

    const activeFilterCount = Object.keys(value).filter(
        key => value[key as keyof FilterState] !== undefined &&
            value[key as keyof FilterState] !== '' &&
            (Array.isArray(value[key as keyof FilterState]) ? (value[key as keyof FilterState] as any[]).length > 0 : true)
    ).length;

    return (
        <div className="space-y-4">
            {/* Filter Toggle Button */}
            <div className="flex items-center gap-2">
                <Button
                    variant={isOpen ? 'default' : 'outline'}
                    onClick={() => setIsOpen(!isOpen)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-1 rounded-full bg-primary-foreground px-2 py-0.5 text-xs text-primary">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="gap-1"
                    >
                        <X className="h-3 w-3" />
                        Clear all
                    </Button>
                )}

                {onSavePreset && activeFilterCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onSavePreset}
                        className="gap-1 ml-auto"
                    >
                        <Save className="h-4 w-4" />
                        Save preset
                    </Button>
                )}
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <Card className="p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        {config.search && (
                            <div className="space-y-2">
                                <Label>Search</Label>
                                <Input
                                    placeholder={config.search.placeholder}
                                    value={value.search || ''}
                                    onChange={(e) => onChange({ ...value, search: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Date Range */}
                        {config.dateRange && (
                            <div className="space-y-2">
                                <Label>{config.dateRange.label}</Label>
                                <DateRangePicker
                                    value={value.dateRange}
                                    onChange={(dateRange) => onChange({ ...value, dateRange })}
                                />
                            </div>
                        )}

                        {/* Multi-Select Filters */}
                        {config.multiSelect?.map((filter) => (
                            <div key={filter.key} className="space-y-2">
                                <Label>{filter.label}</Label>
                                <MultiSelectFilter
                                    options={filter.options}
                                    value={(value[filter.key as keyof FilterState] as string[]) || []}
                                    onChange={(selected) =>
                                        onChange({ ...value, [filter.key]: selected })
                                    }
                                    placeholder={filter.placeholder}
                                />
                            </div>
                        ))}

                        {/* Numeric Range */}
                        {config.numericRange && (
                            <div className="space-y-2">
                                <NumericRangeFilter
                                    label={config.numericRange.label}
                                    value={value.amountRange}
                                    onChange={(amountRange) => onChange({ ...value, amountRange })}
                                    min={config.numericRange.min}
                                    max={config.numericRange.max}
                                    step={config.numericRange.step}
                                />
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
