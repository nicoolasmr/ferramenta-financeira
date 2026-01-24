
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    const requestId = crypto.randomUUID();

    // Tag request with ID
    requestHeaders.set('x-request-id', requestId);

    // You can also add other logic here (auth redirection etc.)
    // For stabilization pack, we focus on traceability.

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Make ID available to client in response header mostly for debugging
    response.headers.set('x-request-id', requestId);

    return response;
}

export const config = {
    matcher: '/:path*',
};
