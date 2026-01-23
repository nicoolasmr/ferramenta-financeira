'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumericRange {
    min?: number;
    max?: number;
}

interface NumericRangeFilterProps {
    value?: NumericRange;
    onChange: (value?: NumericRange) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
}

export function NumericRangeFilter({
    value,
    onChange,
    min,
    max,
    step = 1,
    label = 'Range'
}: NumericRangeFilterProps) {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = e.target.value ? parseFloat(e.target.value) : undefined;
        onChange({ ...value, min: newMin });
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = e.target.value ? parseFloat(e.target.value) : undefined;
        onChange({ ...value, max: newMax });
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex gap-2 items-center">
                <Input
                    type="number"
                    placeholder="Min"
                    value={value?.min ?? ''}
                    onChange={handleMinChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="number"
                    placeholder="Max"
                    value={value?.max ?? ''}
                    onChange={handleMaxChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full"
                />
            </div>
        </div>
    );
}
