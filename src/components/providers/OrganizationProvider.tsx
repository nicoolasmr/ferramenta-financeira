'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Organization } from '@/actions/organization';
import { getActiveOrganization } from '@/actions/organization';

interface OrganizationContextType {
    activeOrganization: Organization | null;
    loading: boolean;
    setActiveOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
    const [activeOrganization, setActiveOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadActiveOrg() {
            try {
                const org = await getActiveOrganization();
                if (org) {
                    setActiveOrg(org);
                } else {
                    console.log('[OrganizationProvider] No active organization found');
                    setActiveOrg(null);
                }
            } catch (error) {
                console.error('[OrganizationProvider] Error loading active organization:', error);
                setActiveOrg(null);
            } finally {
                setLoading(false);
            }
        }
        loadActiveOrg();
    }, []);

    return (
        <OrganizationContext.Provider value={{ activeOrganization, loading, setActiveOrganization: setActiveOrg }}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}
