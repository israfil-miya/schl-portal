import { authConfig } from '@/auth.config';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/api/user', '/api/auth/*']; // Public routes
const ROOT = '/login'; // Root path

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route)); // Use some() for wildcard matching

  // Handle protected routes
  if (!isPublicRoute) {
    if (!isAuthenticated) {
      // Redirect to login for non-authenticated users
      return NextResponse.redirect(new URL(ROOT, nextUrl));
    }
  }

  if (isAuthenticated && pathname === ROOT) {
    // Redirect to home for authenticated users
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // No redirect needed for public routes and authenticated users
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - icon.ico, sitemap.xml, robots.txt (metadata files)
    '/((?!api|_next/static|_next/image|icon.ico|sitemap.xml|robots.txt|studio_click_house_ltd.svg).*)',
  ],
};
