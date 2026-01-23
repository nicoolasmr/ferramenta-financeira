'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadAvatar(file: File) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function updateUserProfile(data: { full_name?: string; avatar_url?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser(); // Safe way to get user on server

    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.auth.updateUser({
        data: {
            full_name: data.full_name,
            avatar_url: data.avatar_url,
        }
    });

    if (error) throw error;

    revalidatePath('/app/settings/profile');
    revalidatePath('/app'); // Refresh layout user info
    return { success: true };
}
