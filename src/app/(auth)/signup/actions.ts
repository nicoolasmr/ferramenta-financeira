"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(prevState: any, formData: FormData) {
    try {
        const supabase = await createClient();

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const email = formData.get("email") as string;
        const full_name = formData.get("full_name") as string;
        const phone = formData.get("phone") as string;

        // Validation
        if (!email || !password || !full_name) {
            return { error: "Please fill in all required fields." };
        }

        if (password !== confirmPassword) {
            return { error: "Passwords do not match." };
        }

        if (password.length < 6) {
            return { error: "Password must be at least 6 characters." };
        }

        const data = {
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone,
                }
            }
        };

        const { error, data: signupData } = await supabase.auth.signUp(data);

        if (error) {
            console.error("Signup error:", error);
            return { error: error.message || "Failed to create account. Please try again." };
        }

        // If email confirmation is enabled, we'd show a message.
        // For now, assuming auto-confirm or dev mode.
        return { message: "Account created successfully! Check your email to confirm." };
    } catch (error: any) {
        console.error("Unexpected signup error:", error);
        return { error: "An unexpected error occurred. Please check your internet connection and try again." };
    }
}
