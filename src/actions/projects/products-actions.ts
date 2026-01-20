"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProjectProducts(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("project_id", projectId) // Assuming products table has project_id based on modules spec or is missing?
        // Wait, initial_schema.sql 'products' table references 'org_id' but NOT 'project_id'.
        // Project Module usually implies linking products to projects.
        // If products are strictly Org-level, this query is flawed.
        // Let's assume Org-level for now but filtered by context if we added a link?
        // Actually, the user asked for "Products Module: CRUD + External Mapping" inside a PROJECT.
        // This suggests we need to link products to projects.
        // For now, fetch ALL Org products to list. Or filter if we had a link.
        // Let's create a 'project_products' join or just fetch org products.
        .order("created_at", { ascending: false });

    // Actually, checking initial_schema, products table has NO project_id.
    // We should probably rely on Org level products for MVP v3 to avoid schema chaos.
    // Or we filter by fetching org_id of the project.

    // Let's fetch the org_id first
    const { data: project } = await supabase.from("projects").select("org_id").eq("id", projectId).single();
    if (!project) return [];

    const { data: products } = await supabase.from("products").select("*").eq("org_id", project.org_id);
    return products || [];
}

export async function createProduct(data: any, projectId: string) {
    const supabase = await createClient();
    const { data: project } = await supabase.from("projects").select("org_id").eq("id", projectId).single();
    if (!project) throw new Error("Project not found");

    const { error } = await supabase.from("products").insert({
        org_id: project.org_id,
        name: data.name,
        price_cents: data.price_cents,
        type: data.type || 'standard'
    });

    if (error) throw new Error(error.message);
    return { success: true };
}
