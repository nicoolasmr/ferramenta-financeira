"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Organization {
    id: string;
    name: string;
    legal_name?: string;
    tax_id?: string;
    address?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();

    if (error) throw error;
    return data;
}

export async function getUserOrganizations(): Promise<Organization[]> {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return [];
    }

    // Get user's memberships
    const { data: memberships, error: memError } = await supabase
        .from("memberships")
        .select("org_id")
        .eq("user_id", user.id);

    if (memError) {
        console.error('Error getting memberships:', memError);
        return [];
    }

    if (!memberships || memberships.length === 0) return [];

    const orgIds = memberships.map(m => m.org_id);
    const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .in("id", orgIds);

    if (error) {
        console.error('Error getting organizations:', error);
        return [];
    }

    return data || [];
}

export async function getActiveOrganization(): Promise<Organization | null> {
    try {
        const orgs = await getUserOrganizations();
        if (orgs.length === 0) return null;
        // For now, return the first one as default active
        return orgs[0];
    } catch (error) {
        console.error("Error fetching active organization:", error);
        return null;
    }
}


export async function createOrganization(formData: {
    name: string;
    slug: string;
    legal_name?: string;
    tax_id?: string;
    address?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Basic Slug Validation
    const slug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (slug.length < 3) {
        throw new Error("Slug must be at least 3 characters");
    }

    const { data, error } = await supabase
        .from("organizations")
        .insert({
            ...formData,
            slug,
            owner_id: user.id, // Ensure owner logic
        })
        .select()
        .single();

    // Add membership for creator
    if (data) {
        await supabase.from("memberships").insert({
            org_id: data.id,
            user_id: user.id,
            role: "owner"
        });
    }

    if (error) {
        if (error.code === '23505') throw new Error("Slug already taken");
        throw error;
    }

    return data;
}

export async function updateOrganization(orgId: string, formData: Partial<Organization>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("organizations")
        .update({
            ...formData,
            updated_at: new Date().toISOString(),
        })
        .eq("id", orgId);

    if (error) throw error;
    revalidatePath("/app/settings/organization");
}

export async function uploadOrganizationLogo(orgId: string, file: File) {
    const supabase = await createClient();

    // Upload to Supabase Storage
    const fileName = `${orgId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("organization-logos")
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from("organization-logos")
        .getPublicUrl(fileName);

    // Update organization with logo URL
    await updateOrganization(orgId, { logo_url: publicUrl });

    return publicUrl;
}
