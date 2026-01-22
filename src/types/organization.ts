export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
    id: string;
    name: string;
    legal_name: string | null;
    tax_id: string | null;
    address: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        country?: string;
    } | null;
    fiscal_data: {
        state_registration?: string;
        municipal_registration?: string;
        tax_regime?: 'simples' | 'presumido' | 'real';
    } | null;
    settings: {
        enforce_mfa?: boolean;
        default_timezone?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface OrganizationMember {
    id: string;
    org_id: string;
    user_id: string;
    role: OrganizationRole;
    invited_by: string | null;
    joined_at: string;
    created_at: string;
}

export interface TeamInvitation {
    id: string;
    org_id: string;
    email: string;
    role: OrganizationRole;
    token: string;
    expires_at: string;
    created_by: string | null;
    accepted_at: string | null;
    created_at: string;
}

export interface CreateOrganizationInput {
    name: string;
    legal_name?: string;
    tax_id?: string;
    address?: Organization['address'];
    fiscal_data?: Organization['fiscal_data'];
}

export interface UpdateOrganizationInput {
    name?: string;
    legal_name?: string;
    tax_id?: string;
    address?: Organization['address'];
    fiscal_data?: Organization['fiscal_data'];
    settings?: Organization['settings'];
}

export interface InviteTeamMemberInput {
    org_id: string;
    email: string;
    role: OrganizationRole;
}
