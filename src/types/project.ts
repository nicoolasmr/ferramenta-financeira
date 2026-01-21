export type ProjectEnvironment = 'production' | 'development' | 'staging';
export type ProjectRegion = 'gru1' | 'us-east-1';

export interface Project {
    id: string;
    organization_id: string;
    name: string;
    slug: string;
    environment: ProjectEnvironment;
    region: ProjectRegion;
    settings: {
        timezone?: string;
        currency?: string;
        webhook_url?: string;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProjectApiKey {
    id: string;
    project_id: string;
    name: string;
    key_prefix: string;
    key_hash: string;
    key_hint: string;
    permissions: {
        read: boolean;
        write: boolean;
    };
    last_used_at: string | null;
    expires_at: string | null;
    revoked_at: string | null;
    created_by: string | null;
    created_at: string;
}

export interface CreateProjectInput {
    organization_id: string;
    name: string;
    environment?: ProjectEnvironment;
    region?: ProjectRegion;
}

export interface UpdateProjectInput {
    name?: string;
    environment?: ProjectEnvironment;
    region?: ProjectRegion;
    settings?: Project['settings'];
    is_active?: boolean;
}

export interface GenerateApiKeyInput {
    project_id: string;
    name: string;
    key_type?: 'secret' | 'publishable';
}

export interface GeneratedApiKey {
    id: string;
    key: string; // Full key - only shown once
    hint: string;
    prefix: string;
}
