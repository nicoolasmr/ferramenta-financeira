"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics(orgId: string) {
    const supabase = await createClient();

    // Use RPC for optimized performance and to avoid fetching raw rows
    const { data: stats, error } = await supabase.rpc("get_dashboard_stats", {
        p_org_id: orgId
    });

    if (error) {
        console.error("Error fetching dashboard stats:", error);
        // Fallback for safety
        return {
            projectsCount: 0,
            customersCount: 0,
            integrationsCount: 0,
            revenueThisMonth: 0,
            revenueMoM: 0,
            revenueTimeline: [],
            recentProjects: [],
        };
    }

    // Fetch recent projects separately (fast query)
    const { data: recentProjects } = await supabase
        .from("projects")
        .select("id, name, status, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(5);

    // Calculate MoM %
    const revenueThisMonth = stats.revenue_this_month || 0;
    const revenueLastMonth = stats.revenue_last_month || 0;
    const revenueMoM = revenueLastMonth === 0 ? 0 : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

    return {
        projectsCount: stats.projects_count || 0,
        customersCount: stats.customers_count || 0,
        integrationsCount: stats.integrations_count || 0,
        revenueThisMonth,
        revenueMoM,
        revenueTimeline: stats.revenue_timeline || [],
        recentProjects: recentProjects || [],
    };
}

export async function getOnboardingStatus(orgId: string) {
    const supabase = await createClient();

    // Check for active integrations
    const { count: integrationsCount } = await supabase
        .from("gateway_integrations")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "active");

    // Check for customers
    const { count: customersCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId);

    // Check for team members (more than 1 means invites happened)
    const { count: teamCount } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId);

    // Check if webhooks are configured
    const { count: webhooksCount } = await supabase
        .from("webhook_endpoints")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId);

    return {
        hasIntegrations: (integrationsCount || 0) > 0,
        hasCustomers: (customersCount || 0) > 0,
        hasTeam: (teamCount || 0) > 1, // Assumes creator is 1
        hasWebhooks: (webhooksCount || 0) > 0,
    };
}
