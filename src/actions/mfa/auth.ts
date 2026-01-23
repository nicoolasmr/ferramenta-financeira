'use server';

import { createClient } from "@/lib/supabase/server";
import { verify } from "otplib";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Cookie configuration
const MFA_COOKIE_NAME = "x-mfa-verified";
const MFA_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function verifyLoginMFA(token: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Get user secret
    const { data: mfaData, error } = await supabase
        .from("user_mfa_secrets")
        .select("secret")
        .eq("user_id", user.id)
        .single();

    if (error || !mfaData) return { error: "MFA not set up for this user" };

    // Verify TOTP
    const isValid = verify({
        token,
        secret: mfaData.secret,
    });

    if (!isValid) return { error: "Invalid code" };

    // Set verification cookie
    const cookieStore = await cookies();
    cookieStore.set(MFA_COOKIE_NAME, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MFA_COOKIE_MAX_AGE,
        path: "/",
    });

    return { success: true };
}

export async function verifyBackupCode(code: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Get user backup codes
    const { data: mfaData, error } = await supabase
        .from("user_mfa_secrets")
        .select("backup_codes")
        .eq("user_id", user.id)
        .single();

    if (error || !mfaData || !mfaData.backup_codes) return { error: "MFA not set up" };

    // Check if code exists (simple string comparison for now, in prod should be hashed)
    // The migration said "hashed", but the setup function stores them as returned by generate_mfa_backup_codes
    // which seems to return hashed values? Let's check the migration again if needed.
    // Re-reading migration 20260122000003_mfa.sql:
    // codes := array_append(codes, encode(digest(code, 'sha256'), 'hex'));
    // So they ARE stored hashed. User inputs raw code. We need to hash input and compare.

    // BUT `setupMFA` or `activateMFA` returns the RAW codes to the user.
    // So the DB has hashes. We need to hash the input `code` and check existence.

    // However, crypto module in Edge Runtime/Node... Supabase client doesn't do hashing for us here.
    // We'll use the Web Crypto API or Node crypto.

    // Let's rely on a database RPC to verify and consume the code to be atomic and safe?
    // Or just fetch and compare in JS if we can hash.

    // For simplicity/speed without adding new migration for 'verify_and_consume':
    // We will hash here.

    const crypto = require('crypto');
    const inputHash = crypto.createHash('sha256').update(code).digest('hex');

    const codeIndex = mfaData.backup_codes.indexOf(inputHash);

    if (codeIndex === -1) {
        return { error: "Invalid backup code" };
    }

    // Remove the used code (Consume it)
    const newCodes = [...mfaData.backup_codes];
    newCodes.splice(codeIndex, 1);

    const { error: updateError } = await supabase
        .from("user_mfa_secrets")
        .update({ backup_codes: newCodes })
        .eq("user_id", user.id);

    if (updateError) return { error: "Failed to update backup codes" };

    // Set verification cookie
    const cookieStore = await cookies();
    cookieStore.set(MFA_COOKIE_NAME, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MFA_COOKIE_MAX_AGE,
        path: "/",
    });

    return { success: true };
}

export async function checkMFAEnrollment() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { isEnabled: false };

    const { data } = await supabase
        .from("user_mfa_secrets")
        .select("enabled_at")
        .eq("user_id", user.id)
        .single();

    return { isEnabled: !!data?.enabled_at };
}

export async function setMFAVerifiedCookie() {
    // Helper to manually set cookie if needed (e.g. after setup)
    const cookieStore = await cookies();
    cookieStore.set(MFA_COOKIE_NAME, "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: MFA_COOKIE_MAX_AGE,
        path: "/",
    });
}
