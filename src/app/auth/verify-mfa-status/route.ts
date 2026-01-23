import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { checkMFAEnrollment } from "@/actions/mfa/auth";

const MFA_COOKIE_NAME = "x-mfa-verified";
const MFA_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function GET(request: Request) {
    const baseUrl = new URL(request.url).origin;

    try {
        // Check if MFA is enabled for the user
        const { isEnabled } = await checkMFAEnrollment();

        if (!isEnabled) {
            // If MFA is not enabled, mark as verified and go to app
            const cookieStore = await cookies();
            cookieStore.set(MFA_COOKIE_NAME, "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: MFA_COOKIE_MAX_AGE,
                path: "/",
            });
            return NextResponse.redirect(`${baseUrl}/app/dashboard`);
        }

        // MFA is enabled, check if we already have the cookie
        const cookieStore = await cookies();
        if (cookieStore.has(MFA_COOKIE_NAME)) {
            return NextResponse.redirect(`${baseUrl}/app/dashboard`);
        }

        // MFA enabled and no cookie -> Challenge
        return NextResponse.redirect(`${baseUrl}/auth/mfa-challenge`);
    } catch (error) {
        console.error("Error in verify-mfa-status route:", error);
        // On error, redirect to login to be safe
        return NextResponse.redirect(`${baseUrl}/login?error=mfa_status_error`);
    }
}
