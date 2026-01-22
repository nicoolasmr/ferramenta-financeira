'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createProject(data: {
    name: string;
    environment: 'production' | 'development' | 'staging';
    region: 'gru1' | 'us-east-1';
    orgId: string;
}) {
    const supabase = await createClient();

    // 1. Generate slug using database function via RPC
    const { data: slugData, error: slugError } = await supabase.rpc('generate_project_slug', {
        project_name: data.name,
        org_id: data.orgId
    });

    if (slugError) {
        console.error('Error generating slug:', slugError);
        throw new Error('Failed to generate project slug');
    }

    // 2. Insert project
    const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert({
            name: data.name,
            slug: slugData,
            environment: data.environment,
            region: data.region,
            org_id: data.orgId,
        })
        .select()
        .single();

    if (insertError) {
        console.error('Error inserting project:', insertError);
        throw insertError;
    }

    // 3. Revalidate paths to reflect changes
    revalidatePath('/app/settings/projects');
    revalidatePath('/app/dashboard');

    return project;
}
