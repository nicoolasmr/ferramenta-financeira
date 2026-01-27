
import { z } from "zod";

export const manualSaleSchema = z.object({
    customerName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    customerEmail: z.string().email("Email inválido"),
    projectId: z.string().min(1, "Selecione um projeto"),
    amount: z.string().min(1, "Valor é obrigatório"), // value from currency input is string or undefined
    installments: z.coerce.number().min(1).max(24),
    method: z.string().min(1),
    // CRM Fields
    niche: z.string().optional(),
    status: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    cycleStart: z.string().optional(),
    cycleEnd: z.string().optional(),
    cycleDuration: z.string().optional(),
    situation: z.string().optional(),
    initialDiagnosis: z.string().optional(),
    mentoredFolder: z.string().optional(),
    meeting1: z.string().optional(),
    contractSigned: z.string().optional(),
    followup: z.string().optional(),
    paymentDetails: z.string().optional(),
});

export type ManualSaleSchema = z.infer<typeof manualSaleSchema>;
