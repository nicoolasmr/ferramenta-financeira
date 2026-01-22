"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics(orgId: string) {
    const supabase = await createClient();

    // Get total projects
    const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId);

    // Get total customers
    const { count: customersCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId);

    // Get active integrations
    const { count: integrationsCount } = await supabase
        .from("gateway_integrations")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "active");

    // Get recent projects
    const { data: recentProjects } = await supabase
        .from("projects")
        .select("id, name, status, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        projectsCount: projectsCount || 0,
        customersCount: customersCount || 0,
        integrationsCount: integrationsCount || 0,
        recentProjects: recentProjects || [],
    };
}
