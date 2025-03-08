import { NextResponse } from 'next/server';
import { auth as authMiddleware } from './auth';

const PUBLIC_ROUTES = ['/login', '/forbidden']; // Public routes
const ROOT = '/login'; // Root path
const FORBIDDEN_REDIRECT = '/forbidden'; // Redirect path for forbidden access
const ALLOWED_ROLES = ['admin', 'super']; // Allowed roles if IP is not in ALLOWED_IPS
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',') || [];

export default authMiddleware((req: any) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Pull user info
  const userRole = req.auth?.user?.role || '';

  // Get client IP from request
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipFromForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];

  const clientIp =
    ipFromForwarded ||
    req.ip ||
    (process.env.NODE_ENV === 'development' ? '0.0.0.0' : '');

  // Auth checks
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // 1. If this is not a public route:
  //    - Require authentication
  //    - Enforce IP or role checks
  if (!isPublicRoute) {
    // Not authenticated? => redirect to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(ROOT, nextUrl));
    }

    // Authenticated but not on an allowed IP? => must have an allowed role
    // If not, redirect to /forbidden
    if (!ALLOWED_IPS.includes(clientIp) && !ALLOWED_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL(FORBIDDEN_REDIRECT, nextUrl));
    }
  }

  // 2. If authenticated and trying to access /forbidden => redirect to home
  if (!isAuthenticated && pathname === FORBIDDEN_REDIRECT) {
    return NextResponse.redirect(new URL(ROOT, nextUrl));
  }

  // 2. If authenticated and trying to access /forbidden => redirect to home
  if (
    isAuthenticated &&
    pathname == FORBIDDEN_REDIRECT &&
    (ALLOWED_IPS.includes(clientIp) || ALLOWED_ROLES.includes(userRole))
  ) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 3. If authenticated and trying to access /login => redirect to home
  if (isAuthenticated && pathname === ROOT) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 4. Otherwise, allow the request to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - icon.ico, sitemap.xml, robots.txt (metadata files)
    '/((?!api|_next/static|_next/image|icon.ico|sitemap.xml|robots.txt).*)',
  ],
};
