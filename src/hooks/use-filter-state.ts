'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import type { FilterState } from '@/components/filters/types';

export function useFilterState(initialFilters: FilterState = {}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<FilterState>(() => {
        // Initialize from URL params
        const urlFilters: FilterState = {};

        const search = searchParams.get('search');
        if (search) urlFilters.search = search;

        const status = searchParams.get('status');
        if (status) urlFilters.status = status.split(',');

        const tags = searchParams.get('tags');
        if (tags) urlFilters.tags = tags.split(',');

        const paymentMethod = searchParams.get('paymentMethod');
        if (paymentMethod) urlFilters.paymentMethod = paymentMethod.split(',');

        const provider = searchParams.get('provider');
        if (provider) urlFilters.provider = provider.split(',');

        const source = searchParams.get('source');
        if (source) urlFilters.source = source.split(',');

        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        if (dateFrom && dateTo) {
            urlFilters.dateRange = {
                from: new Date(dateFrom),
                to: new Date(dateTo),
                preset: (searchParams.get('datePreset') as any) || 'custom'
            };
        }

        const amountMin = searchParams.get('amountMin');
        const amountMax = searchParams.get('amountMax');
        if (amountMin || amountMax) {
            urlFilters.amountRange = {
                min: amountMin ? parseFloat(amountMin) : undefined,
                max: amountMax ? parseFloat(amountMax) : undefined
            };
        }

        return { ...initialFilters, ...urlFilters };
    });

    // Debounced URL update
    const updateUrl = useDebouncedCallback((newFilters: FilterState) => {
        const params = new URLSearchParams();

        if (newFilters.search) {
            params.set('search', newFilters.search);
        }

        if (newFilters.status?.length) {
            params.set('status', newFilters.status.join(','));
        }

        if (newFilters.tags?.length) {
            params.set('tags', newFilters.tags.join(','));
        }

        if (newFilters.paymentMethod?.length) {
            params.set('paymentMethod', newFilters.paymentMethod.join(','));
        }

        if (newFilters.provider?.length) {
            params.set('provider', newFilters.provider.join(','));
        }

        if (newFilters.source?.length) {
            params.set('source', newFilters.source.join(','));
        }

        if (newFilters.dateRange) {
            params.set('dateFrom', newFilters.dateRange.from.toISOString());
            params.set('dateTo', newFilters.dateRange.to.toISOString());
            if (newFilters.dateRange.preset) {
                params.set('datePreset', newFilters.dateRange.preset);
            }
        }

        if (newFilters.amountRange) {
            if (newFilters.amountRange.min !== undefined) {
                params.set('amountMin', newFilters.amountRange.min.toString());
            }
            if (newFilters.amountRange.max !== undefined) {
                params.set('amountMax', newFilters.amountRange.max.toString());
            }
        }

        const queryString = params.toString();
        const currentPath = window.location.pathname;
        router.push(queryString ? `${currentPath}?${queryString}` : currentPath, {
            scroll: false
        });
    }, 500);

    const handleFilterChange = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);
        updateUrl(newFilters);
    }, [updateUrl]);

    return {
        filters,
        setFilters: handleFilterChange,
        clearFilters: () => handleFilterChange({})
    };
}
