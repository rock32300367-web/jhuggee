import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Get hostname (e.g., 'sellers.jhuggee.com', 'localhost:3000', 'sellers.localhost:3000')
    const hostname = req.headers.get('host') || '';

    // Check if we are on the 'sellers' subdomain
    if (hostname.startsWith('sellers.')) {
        // If the path already has /seller, do not rewrite again to avoid loops
        if (!url.pathname.startsWith('/seller')) {
            // Rewrite the URL internally to point to the /seller folder
            url.pathname = `/seller${url.pathname === '/' ? '/dashboard' : url.pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

// Ensure middleware runs only on desired paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
};
