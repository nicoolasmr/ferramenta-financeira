import { z } from "zod";

export const onboardingSchema = z.object({
    orgName: z.string().min(3),
    orgSlug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
    projectName: z.string().min(3),
    planCode: z.enum(["starter", "pro", "agency"]),
    integration: z.string().optional(),
});
