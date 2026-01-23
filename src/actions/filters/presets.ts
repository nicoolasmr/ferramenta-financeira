'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { FilterPreset, FilterState } from '@/components/filters/types';

export async function getFilterPresets(page: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await supabase
        .from('filter_presets')
        .select('*')
        .eq('page', page)
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('name');

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data as FilterPreset[] };
}

export async function saveFilterPreset(
    page: string,
    name: string,
    filters: FilterState,
    isDefault = false
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get active organization
    const { data: memberships } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

    if (!memberships) {
        return { success: false, error: 'No organization found' };
    }

    // If setting as default, unset other defaults
    if (isDefault) {
        await supabase
            .from('filter_presets')
            .update({ is_default: false })
            .eq('org_id', memberships.org_id)
            .eq('user_id', user.id)
            .eq('page', page);
    }

    const { data, error } = await supabase
        .from('filter_presets')
        .insert({
            org_id: memberships.org_id,
            user_id: user.id,
            page,
            name,
            filters,
            is_default: isDefault
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/app/${page}`);
    return { success: true, data: data as FilterPreset };
}

export async function updateFilterPreset(
    id: string,
    updates: Partial<Pick<FilterPreset, 'name' | 'filters' | 'is_default'>>
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // If setting as default, get the preset first to know the page
    if (updates.is_default) {
        const { data: preset } = await supabase
            .from('filter_presets')
            .select('page, org_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (preset) {
            // Unset other defaults for this page
            await supabase
                .from('filter_presets')
                .update({ is_default: false })
                .eq('org_id', preset.org_id)
                .eq('user_id', user.id)
                .eq('page', preset.page);
        }
    }

    const { data, error } = await supabase
        .from('filter_presets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data as FilterPreset };
}

export async function deleteFilterPreset(id: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('filter_presets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
