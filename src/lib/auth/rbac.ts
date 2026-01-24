
import { createClient } from "@/lib/supabase/server";

export type Permission =
    | 'billing.manage'
    | 'integrations.manage'
    | 'dunning.manage'
    | 'settings.view'
    | 'audit.view';

export type Role = 'owner' | 'admin' | 'viewer';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    owner: ['billing.manage', 'integrations.manage', 'dunning.manage', 'settings.view', 'audit.view'],
    admin: ['integrations.manage', 'dunning.manage', 'settings.view', 'audit.view'],
    viewer: ['settings.view']
};

export async function hasPermission(permission: Permission): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Get User Role in Org
    // Assuming 'organization_members' has a 'role' column. If not, defaulting to 'owner' for MVP.
    const { data: member } = await supabase.from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .single();

    const role = (member?.role || 'owner') as Role;
    const permissions = ROLE_PERMISSIONS[role] || [];

    return permissions.includes(permission);
}

export async function requirePermission(permission: Permission) {
    const allowed = await hasPermission(permission);
    if (!allowed) {
        throw new Error(`Unauthorized. Required permission: ${permission}`);
    }
}
