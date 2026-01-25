import { describe, it, expect } from 'vitest';
import { onboardingSchema } from './schema';

describe('Onboarding Schema Validation', () => {
    it('should validate correct data', () => {
        const validData = {
            orgName: 'Acme Corp',
            orgSlug: 'acme-corp',
            projectName: 'Launch Q1',
            planCode: 'pro',
            integration: 'stripe'
        };
        const result = onboardingSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail with short org name', () => {
        const invalidData = {
            orgName: 'Ab',
            orgSlug: 'acme-corp',
            projectName: 'Launch Q1',
            planCode: 'pro',
            integration: 'stripe'
        };
        const result = onboardingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail with invalid slug characters', () => {
        const invalidData = {
            orgName: 'Acme Corp',
            orgSlug: 'Acme Corp', // Spaces and Caps
            projectName: 'Launch Q1',
            planCode: 'pro',
            integration: 'stripe'
        };
        const result = onboardingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it('should fail with invalid plan code', () => {
        const invalidData = {
            orgName: 'Acme Corp',
            orgSlug: 'acme-corp',
            projectName: 'Launch Q1',
            planCode: 'enterprise', // Invalid
            integration: 'stripe'
        };
        const result = onboardingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
