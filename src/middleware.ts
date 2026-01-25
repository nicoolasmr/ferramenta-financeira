import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    const requestId = crypto.randomUUID();

    // Tag request with ID
    requestHeaders.set('x-request-id', requestId);

    // Filter requests - do not process static files
    if (request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|css|js|ico|json)$/)) {
        return NextResponse.next();
    }

    // Refresh Session (Supabase Auth)
    // This is critical for Server Components to access cookies
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
