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

export function OrganizationProvider({
    children,
    initialOrganization = null
}: {
    children: React.ReactNode;
    initialOrganization?: Organization | null;
}) {
    const [activeOrganization, setActiveOrg] = useState<Organization | null>(initialOrganization);
    const [loading, setLoading] = useState(!initialOrganization);

    useEffect(() => {
        if (initialOrganization) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        async function loadActiveOrg() {
            try {
                const org = await getActiveOrganization();
                if (isMounted) {
                    if (org) {
                        console.log('[OrganizationProvider] Active organization loaded:', org.name);
                        setActiveOrg(org);
                    } else {
                        console.warn('[OrganizationProvider] No active organization found after fetch');
                        setActiveOrg(null);
                    }
                }
            } catch (error) {
                console.error('[OrganizationProvider] Error loading active organization:', error);
                if (isMounted) setActiveOrg(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadActiveOrg();
        return () => { isMounted = false; };
    }, [initialOrganization]);

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
