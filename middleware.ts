import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs after the HTML is generated but before it's sent to the client
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add a Content-Security-Policy header to prevent extensions from modifying the DOM
  response.headers.set(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 