import { NextResponse } from 'next/server';
import { auth as authMiddleware } from './auth';
import { PermissionValue } from './permissions';
import {
  allAuthorizedRoutes,
  AuthorizedRoute,
  isRouteAuthorized,
} from './route';

const LOGIN_ROUTE = '/login';
const PUBLIC_ROUTES = [LOGIN_ROUTE, '/forbidden'];
const SSO_LOGIN_TARGET = process.env.SSO_LOGIN_URL;
const FORBIDDEN_REDIRECT = '/forbidden';
const ALLOWED_IPS = process.env.ALLOWED_IPS?.split(',') || [];

// Using cached flattened route list from route.ts (includes containers & leaves)
const ALL_ROUTES: AuthorizedRoute[] = allAuthorizedRoutes;

function resolveLoginRedirect(nextUrl: URL) {
  if (SSO_LOGIN_TARGET) {
    try {
      return new URL(SSO_LOGIN_TARGET);
    } catch (error) {
      console.error(
        'Invalid SSO_LOGIN_URL value, falling back to /login',
        error,
      );
    }
  }
  return new URL(LOGIN_ROUTE, nextUrl);
}

export default authMiddleware((req: any) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // --- User info ---
  const userPermissions: PermissionValue[] = req.auth?.user?.permissions || [];

  // --- Client IP ---
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipFromForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0];

  const clientIp =
    ipFromForwarded ||
    (process.env.NODE_ENV === 'development' ? '127.0.0.1' : null);

  // --- Route checks ---
  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/'),
  );

  // 1. Protected routes
  if (!isPublicRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(resolveLoginRedirect(nextUrl));
    }

    if (
      clientIp &&
      !ALLOWED_IPS.includes(clientIp) &&
      !userPermissions.includes('settings:bypass_ip_restrictions')
    ) {
      return NextResponse.redirect(new URL(FORBIDDEN_REDIRECT, nextUrl));
    }

    const matchingRoute = ALL_ROUTES.filter(r => {
      if (r.href === '/') return pathname === '/';
      return pathname === r.href || pathname.startsWith(r.href + '/');
    }).sort((a, b) => b.href.length - a.href.length)[0];

    if (matchingRoute && !isRouteAuthorized(matchingRoute, userPermissions)) {
      return NextResponse.redirect(new URL(FORBIDDEN_REDIRECT, nextUrl));
    }
  }

  // 2. Forbidden page handling
  if (!isAuthenticated && pathname === FORBIDDEN_REDIRECT) {
    return NextResponse.redirect(resolveLoginRedirect(nextUrl));
  }

  if (
    isAuthenticated &&
    pathname === FORBIDDEN_REDIRECT &&
    (ALLOWED_IPS.includes(clientIp || '') ||
      userPermissions.includes('settings:bypass_ip_restrictions'))
  ) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 3. Login page handling
  if (isAuthenticated && pathname === LOGIN_ROUTE) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 4. Allow request
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|icon.ico|sitemap.xml|robots.txt|images).*)',
  ],
  runtime: 'nodejs',
};
