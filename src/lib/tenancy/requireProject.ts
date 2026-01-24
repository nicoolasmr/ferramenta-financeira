
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireOrg } from "./requireOrg";

/**
 * Enforces that a user has access to a specific Project.
 * (Implicitly checks Org membership via project->org link)
 */
export async function requireProject(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Check project existence and RLS access
    // RLS should filter projects we don't have access to (via org membership).
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, org_id, name')
        .eq('id', projectId)
        .single();

    if (error || !project) {
        throw new Error(`Project not found or access denied: ${projectId}`);
    }

    // Double check org membership explicitly if needed, but RLS 'projects' policy usually relies on it.
    // For safety in 'Stabilization Pack', let's verify org membership explicitly too.
    const { role } = await requireOrg(project.org_id);

    return { supabase, user, project, role, orgId: project.org_id };
}
