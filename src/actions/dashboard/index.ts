"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics(orgId: string) {
    const supabase = await createClient();

    // Validate if organization exists and belongs to user
    const { data: org } = await supabase
        .from("organizations")
        .select("id, created_at")
        .eq("id", orgId)
        .single();

    if (!org) {
        throw new Error("Organization not found");
    }

    // Check if organization is new (e.g. created less than 1 hour ago)
    // and has no real data.
    // Ideally we would check for transactions, customers, etc.
    const { count: customersCount } = await supabase
        .from("customers")
        .select("id", { count: 'exact', head: true })
        .eq("org_id", orgId);

    const { count: projectsCount } = await supabase
        .from("projects")
        .select("id", { count: 'exact', head: true })
        .eq("org_id", orgId);

    // If practically empty, return zero state (no mocks)
    if ((customersCount === 0 || customersCount === null) &&
        (projectsCount === 0 || projectsCount === null || projectsCount <= 1)) { // Allow 1 project (default)
        return {
            projectsCount: projectsCount || 0,
            customersCount: 0,
            integrationsCount: 0,
            revenueThisMonth: 0,
            revenueMoM: 0,
            revenueTimeline: [],
            recentProjects: []
        };
    }

    // ... (rest of the logic for real metrics) ... 
    // BUT since we don't have real metric calculation logic fully implemented yet,
    // we should return 0 instead of hardcoded mocks if we want to avoid "lying".
    // Or at least make it clear it's demo data.

    // For now, I will return 0s to avoid confusion, as requested.
    // If the user connects an integration, we would populate this.

    return {
        projectsCount: projectsCount || 0,
        customersCount: customersCount || 0,
        integrationsCount: 0,
        revenueThisMonth: 0,
        revenueMoM: 0,
        revenueTimeline: [],
        recentProjects: []
    };
}
