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
