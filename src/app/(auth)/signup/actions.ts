"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        options: {
            data: {
                full_name: formData.get("full_name") as string,
                phone: formData.get("phone") as string,
            }
        }
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
        return { error: error.message };
    }

    // If email confirmation is enabled, we'd show a message.
    // For now, assuming auto-confirm or dev mode.
    return { message: "Check your email to confirm your account." };
}
