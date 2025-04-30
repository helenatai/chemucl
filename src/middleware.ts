import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Check if the user is an admin for admin-only routes
    if (req.nextUrl.pathname.startsWith('/admin') && req.nextauth.token?.permission !== 'Admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/inventory-page/:path*',
    '/location-page/:path*',
    '/audit-page/:path*',
    '/logs-page/:path*',
    '/admin/:path*'
  ]
};
