
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Enforces that a user is authenticated and belongs to the specified Organization.
 * returns the supabase client and the org_id.
 */
export async function requireOrg(orgId?: string) {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // If orgId is not provided, we might look for a default or currently active one from DB/Session
    // But typically this is used when we HAVE an ID from params.
    if (!orgId) {
        throw new Error("Organization Context Missing");
    }

    // Check membership
    // We assume RLS policies handle the "SELECT" on organizations/memberships table.
    // So if we can select it, we are a member.
    const { data: membership, error } = await supabase
        .from('memberships')
        .select('role')
        .eq('org_id', orgId)
        .eq('user_id', user.id)
        .single();

    if (error || !membership) {
        // Not a member or error
        redirect("/app"); // Redirect to home or 403 page
    }

    return { supabase, user, role: membership.role, orgId };
}
