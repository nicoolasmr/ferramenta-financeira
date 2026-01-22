"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

export async function getMFAStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { enabled: false };

    const { data, error } = await supabase
        .from("user_mfa_secrets")
        .select("enabled_at")
        .eq("user_id", user.id)
        .single();

    if (error || !data) return { enabled: false };
    return { enabled: !!data.enabled_at };
}

export async function setupMFA() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const secret = generateSecret();
    const otpauth = generateURI({
        secret,
        label: user.email!,
        issuer: "RevenueOS",
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // Save temporary secret (or update existing one)
    const { error } = await supabase
        .from("user_mfa_secrets")
        .upsert({
            user_id: user.id,
            secret: secret,
            updated_at: new Date().toISOString(),
        });

    if (error) throw new Error("Failed to setup MFA");

    return { qrCodeUrl, secret };
}

export async function activateMFA(token: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("user_mfa_secrets")
        .select("secret")
        .eq("user_id", user.id)
        .single();

    if (error || !data) throw new Error("MFA not set up");

    const isValid = verify({
        token,
        secret: data.secret,
    });

    if (!isValid) throw new Error("Invalid code");

    // Enable MFA and generate backup codes (using the DB function)
    const { data: backupCodes, error: codesError } = await supabase.rpc('generate_mfa_backup_codes');

    if (codesError) throw new Error("Failed to generate backup codes");

    const { error: updateError } = await supabase
        .from("user_mfa_secrets")
        .update({
            enabled_at: new Date().toISOString(),
            backup_codes: backupCodes,
        })
        .eq("user_id", user.id);

    if (updateError) throw new Error("Failed to activate MFA");

    revalidatePath("/app/settings/security/mfa");
    return { backupCodes };
}

export async function disableMFA() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("user_mfa_secrets")
        .delete()
        .eq("user_id", user.id);

    if (error) throw new Error("Failed to disable MFA");

    revalidatePath("/app/settings/security/mfa");
}
