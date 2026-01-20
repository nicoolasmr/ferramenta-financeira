import { z } from "zod";

export const AIPlanSchema = z.object({
    total_amount: z.number().describe("Total value in BRL (e.g., 1000 for R$ 1000,00)"),
    installments_count: z.number().min(1).max(36),
    interval_months: z.number().default(1),
    first_due_date: z.string().optional().describe("YYYY-MM-DD"),
    day_of_month: z.number().min(1).max(31).optional(),
});

export const AICustomerSchema = z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

export const AIEnrollmentSchema = z.object({
    project_id: z.string().optional(), // If inferred
    customer: AICustomerSchema,
    plan: AIPlanSchema,
    niche: z.string().optional(),
});

export type AIEnrollment = z.infer<typeof AIEnrollmentSchema>;

export const AIMessageSchema = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
});

export type AIMessage = z.infer<typeof AIMessageSchema>;
