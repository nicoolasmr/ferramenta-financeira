"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Project {
    id: string;
    org_id: string;
    name: string;
    slug: string;
    description: string | null;
    environment: 'production' | 'development' | 'staging';
    region: 'gru1' | 'us-east-1';
    status: string;
    settings: any;
    created_at: string;
    updated_at: string;
}

export async function getProjects(orgId: string): Promise<Project[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Failed to fetch projects");
    }

    return data || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching project:", error);
        return null;
    }

    return data;
}

export async function createProject(formData: {
    name: string;
    description?: string;
    environment: 'production' | 'development' | 'staging';
    region: 'gru1' | 'us-east-1';
    org_id: string;
}) {
    const supabase = await createClient();

    // Generate slug using database function
    let slug = `project-${Date.now()}`;
    const { data: slugData, error: slugError } = await supabase.rpc('generate_project_slug', {
        project_name: formData.name,
        org_id: formData.org_id
    });

    if (!slugError && slugData) {
        slug = slugData;
    }

    const { data, error } = await supabase
        .from("projects")
        .insert({
            name: formData.name,
            slug: slug,
            description: formData.description || null,
            environment: formData.environment,
            region: formData.region,
            org_id: formData.org_id,
            status: "active",
            settings: {},
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
    }

    revalidatePath("/app/projects");
    return data;
}

export async function updateProject(id: string, formData: {
    name?: string;
    description?: string;
    status?: string;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("projects")
        .update({
            ...formData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating project:", error);
        throw new Error("Failed to update project");
    }

    revalidatePath("/app/projects");
    revalidatePath(`/app/projects/${id}`);
    return data;
}

export async function deleteProject(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting project:", error);
        throw new Error("Failed to delete project");
    }

    revalidatePath("/app/projects");
}

export async function getProjectProducts(projectId: string) {
    const supabase = await createClient();

    // 1. Fetch products linked directly to the project
    const { data: directProducts } = await supabase
        .from("products")
        .select("*")
        .eq("project_id", projectId);

    // 2. Fetch products linked via orders (legacy/sales based)
    const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .eq("project_id", projectId);

    let salesProducts: any[] = [];
    if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const { data } = await supabase
            .from("order_items")
            .select("product:products(*)")
            .in("order_id", orderIds);

        salesProducts = (data || []).map(item => item.product as any);
    }

    // Combine and deduplicate
    const allProducts = [...(directProducts || []), ...salesProducts].filter(p => p !== null);
    const uniqueProducts = allProducts.filter((p, index, self) =>
        self.findIndex(s => s.id === p.id) === index
    );

    return uniqueProducts;
}

export async function createProduct(formData: {
    org_id: string;
    project_id?: string;
    name: string;
    description?: string;
    type: string;
    price_cents: number;
}) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .insert({
            org_id: formData.org_id,
            project_id: formData.project_id || null,
            name: formData.name,
            description: formData.description || null,
            type: formData.type || "standard",
            price_cents: formData.price_cents,
            active: true
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
    }

    revalidatePath("/app/projects");
    if (formData.project_id) {
        revalidatePath(`/app/projects/${formData.project_id}`);
    }
    return data;
}

export async function getProjectBuyers(projectId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("orders")
        .select("customer:customers(*)")
        .eq("project_id", projectId);

    if (error) {
        console.error("Error fetching project buyers:", error);
        throw new Error("Failed to fetch project buyers");
    }

    // Deduplicate customers
    const customers = (data || [])
        .map(item => item.customer as any)
        .filter((c, index, self) => c && self.findIndex(s => s?.id === c.id) === index);

    return customers;
}

