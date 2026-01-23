import { z } from 'zod';

const CustomerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    document: z.string().optional().or(z.literal('')),
    external_id: z.string().optional().or(z.literal(''))
});

export interface ValidationResult {
    valid: Record<string, any>[];
    invalid: {
        row: number;
        data: Record<string, any>;
        errors: string[];
    }[];
}

export function validateCustomers(data: Record<string, any>[]): ValidationResult {
    const valid: Record<string, any>[] = [];
    const invalid: ValidationResult['invalid'] = [];

    data.forEach((row, index) => {
        const result = CustomerSchema.safeParse(row);
        if (result.success) {
            valid.push(result.data);
        } else {
            invalid.push({
                row: index + 2, // +2 because index is 0-based and we skip header
                data: row,
                errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
            });
        }
    });

    return { valid, invalid };
}

export function checkDuplicates(
    data: Record<string, any>[],
    field: 'email' | 'external_id'
): { duplicates: number[]; unique: Record<string, any>[] } {
    const seen = new Set<string>();
    const duplicates: number[] = [];
    const unique: Record<string, any>[] = [];

    data.forEach((row, index) => {
        const value = row[field];
        if (value && seen.has(value)) {
            duplicates.push(index + 2);
        } else {
            if (value) seen.add(value);
            unique.push(row);
        }
    });

    return { duplicates, unique };
}
