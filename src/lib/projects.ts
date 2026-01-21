import { createClient } from '@/lib/supabase/server';
import type {
    Project,
    ProjectApiKey,
    CreateProjectInput,
    UpdateProjectInput,
    GenerateApiKeyInput,
    GeneratedApiKey,
} from '@/types/project';

export async function createProject(input: CreateProjectInput): Promise<Project> {
    const supabase = await createClient();

    // Generate slug
    const { data: slugData } = await supabase.rpc('generate_project_slug', {
        project_name: input.name,
        org_id: input.organization_id,
    });

    const { data, error } = await supabase
        .from('projects')
        .insert({
            organization_id: input.organization_id,
            name: input.name,
            slug: slugData,
            environment: input.environment || 'production',
            region: input.region || 'gru1',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProject(id: string): Promise<Project | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function getOrganizationProjects(organizationId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateProject(
    id: string,
    input: UpdateProjectInput
): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProject(id: string): Promise<void> {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
        .from('projects')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

export async function generateApiKey(
    input: GenerateApiKeyInput
): Promise<GeneratedApiKey> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('generate_api_key', {
        p_project_id: input.project_id,
        p_name: input.name,
        p_key_type: input.key_type || 'secret',
    });

    if (error) throw error;
    return data;
}

export async function getProjectApiKeys(projectId: string): Promise<ProjectApiKey[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('project_api_keys')
        .select('*')
        .eq('project_id', projectId)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function revokeApiKey(keyId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('project_api_keys')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', keyId);

    if (error) throw error;
}

export async function updateApiKeyLastUsed(keyHash: string): Promise<void> {
    const supabase = await createClient();

    await supabase
        .from('project_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('key_hash', keyHash)
        .is('revoked_at', null);
}
