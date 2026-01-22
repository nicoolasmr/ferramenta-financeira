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
