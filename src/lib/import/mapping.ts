import { z } from "zod";

export const ImportRowSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    project_id: z.string().optional(), // Can be defaulted
    total_amount: z.string().transform((val) => {
        // Parse "1000", "1.000", "R$ 1000" -> number
        const cleaned = val.replace(/[^0-9,]/g, '').replace(',', '.');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }).refine(val => val > 0, "Amount must be > 0"),
    installments: z.string().transform(val => parseInt(val) || 1).refine(val => val >= 1 && val <= 36, "1-36 installments"),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

export type ValidationError = {
    row: number;
    errors: Record<string, string[]>;
};

export function validateImportData(rows: Record<string, string>[]): { valid: ImportRow[], errors: ValidationError[] } {
    const valid: ImportRow[] = [];
    const errors: ValidationError[] = [];

    rows.forEach((row, index) => {
        const parsed = ImportRowSchema.safeParse(row);
        if (parsed.success) {
            valid.push(parsed.data);
        } else {
            errors.push({
                row: index + 1,
                errors: parsed.error.flatten().fieldErrors as Record<string, string[]>
            });
        }
    });

    return { valid, errors };
}
