import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkMFAEnrollment, setMFAVerifiedCookie } from "@/actions/mfa/auth";

export default async function VerifyMfaStatusPage() {
    // This page acts as a controller. It renders nothing, just redirects.

    // Check if MFA is enabled for the user
    const { isEnabled } = await checkMFAEnrollment();

    if (!isEnabled) {
        // If MFA is not enabled, mark as verified and go to app
        await setMFAVerifiedCookie();
        redirect("/app/dashboard");
    }

    // MFA is enabled, check if we already have the cookie (double check)
    // If we are here, likely middleware sent us or login sent us.
    // If we have cookie, middleware would have let us pass to /app, 
    // but maybe login sent us here directly.
    const cookieStore = await cookies();
    if (cookieStore.has("x-mfa-verified")) {
        redirect("/app/dashboard");
    }

    // MFA enabled and no cookie -> Challenge
    redirect("/auth/mfa-challenge");
}
