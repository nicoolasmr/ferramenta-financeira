import { createClient } from '@/lib/supabase/server';
import type {
    Organization,
    OrganizationMember,
    TeamInvitation,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    InviteTeamMemberInput,
} from '@/types/organization';

export async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('organizations')
        .insert({
            name: input.name,
            legal_name: input.legal_name,
            tax_id: input.tax_id,
            address: input.address,
            fiscal_data: input.fiscal_data,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getOrganization(id: string): Promise<Organization | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function getUserOrganizations(): Promise<Organization[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('organizations')
        .select(`
      *,
      memberships!inner(user_id)
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateOrganization(
    id: string,
    input: UpdateOrganizationInput
): Promise<Organization> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('organizations')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getOrganizationMembers(
    organizationId: string
): Promise<OrganizationMember[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('org_id', organizationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function inviteTeamMember(
    input: InviteTeamMemberInput
): Promise<TeamInvitation> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('team_invitations')
        .insert({
            org_id: input.org_id,
            email: input.email,
            role: input.role,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getTeamInvitations(
    organizationId: string
): Promise<TeamInvitation[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('org_id', organizationId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function acceptInvitation(token: string): Promise<{
    success: boolean;
    org_id?: string;
    error?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('accept_team_invitation', {
        invitation_token: token,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return data;
}

export async function revokeInvitation(invitationId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

    if (error) throw error;
}

export async function removeMember(memberId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', memberId);

    if (error) throw error;
}

export async function updateMemberRole(
    memberId: string,
    role: 'owner' | 'admin' | 'member'
): Promise<OrganizationMember> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('memberships')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
