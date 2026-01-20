export type IntegrationProvider = 'stripe' | 'hotmart' | 'kiwify' | 'asaas' | 'eduzz';

export interface IntegrationConfig {
    id: string;
    provider: IntegrationProvider;
    status: 'active' | 'paused' | 'error';
    // secrets are kept server-side only
}

export const PROVIDERS: { id: IntegrationProvider; name: string; icon: string }[] = [
    { id: 'stripe', name: 'Stripe', icon: 'credit-card' },
    { id: 'hotmart', name: 'Hotmart', icon: 'flame' },
    { id: 'kiwify', name: 'Kiwify', icon: 'crocodile' }, // metaphorical
    { id: 'asaas', name: 'Asaas', icon: 'banknote' },
];

// Mock for UI listing
export async function getIntegrations(orgId: string) {
    // In real app, query 'integrations' table
    return [];
}
