import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Safety Check: If env vars are missing (e.g. during build or missing .env), skip Supabase logic
    // This prevents "MIDDLEWARE_INVOCATION_FAILED" 500 errors.
    if (!supabaseUrl || !supabaseKey) {
        // If visiting a protected route without env vars, we can't authenticate.
        // For strictness, you might want to error, but for resilience, we let it pass (or redirect to error).
        // Here we'll just log and continue, assuming the app might handle the missing auth later or it's a public route.
        // However, if it's /app, we should probably redirect to login or show an error.
        if (request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/ops')) {
            console.error("Middleware: Missing Supabase URL/Key. Redirecting to login.");
            return NextResponse.redirect(new URL('/login?error=missing_env', request.url));
        }
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect /app, /ops, and /portal routes
    if (request.nextUrl.pathname.startsWith('/app') ||
        request.nextUrl.pathname.startsWith('/ops') ||
        request.nextUrl.pathname.startsWith('/portal')) {

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // MFA Check: Check for the verification cookie
        // Note: We only check if the cookie exists. The database check for enrollment happens at login time (interstitial).
        // If the user has enrollment but no cookie, we redirect to verify-status.
        // We optimize by checking cookie existence first.

        // However, we must know if the user HAS MFA enabled to decide if we block or pass.
        // Checking DB in middleware is expensive (already called getUser though).
        // Strategy: 
        // 1. If cookie exists -> Pass.
        // 2. If cookie missing -> Redirect to /auth/verify-mfa-status (which checks DB and redirects back or challenges).

        // This relies on verify-mfa-status looping. 
        // We avoid infinite loop because verify-mfa-status is NOT in the protected path prefix (it's /auth/).

        const mfaVerified = request.cookies.get('x-mfa-verified');
        if (!mfaVerified) {
            // Redirect to status check which will either challenge or set cookie and redirect back
            return NextResponse.redirect(new URL('/auth/verify-mfa-status', request.url));
        }
    }

    // Redirect / to /app if logged in, else /login (or keep on landing page /)
    if (request.nextUrl.pathname === '/') {
        if (user) {
            return NextResponse.redirect(new URL('/app/dashboard', request.url))
        }
    }

    // Redirect /app directly to /app/dashboard
    if (request.nextUrl.pathname === '/app') {
        return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
