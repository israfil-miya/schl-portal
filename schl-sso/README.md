# Studio Click House – SSO Service

This Next.js application acts as the dedicated single-sign-on entry point for the Studio Click House suite. Users authenticate once here and are redirected to the appropriate portal based on their role permissions.

## Features

- Uses the shared `shared/` package for permission definitions and NextAuth callbacks so session data matches the portal projects.
- Delegates credential validation to the portal API (`/api/user?action=handle-login`) via the credentials provider.
- Issues cookies for the parent domain when `AUTH_COOKIE_DOMAIN` is configured, allowing `portal.domain.com` and `crm.domain.com` to consume the same session token.
- Redirects users after login according to the permissions returned by the API (`login:crm`, `login:portal`) with an optional fallback.

## Required environment variables

Copy `example.env.local` to `.env.local` and update the following values:

- `AUTH_SECRET` – must match the secret used by the portal and marketers apps.
- `NEXTAUTH_URL` – base URL for the SSO deployment (e.g. `https://sso.domain.com`).
- `AUTH_COOKIE_DOMAIN` – Optional. Set to `.domain.com` so the session cookie is shared with sibling subdomains.
- `PORTAL_API_BASE_URL` – Origin of the portal app (e.g. `https://portal.domain.com`) used for login verification.
- `NEXT_PUBLIC_ADMIN_PORTAL_URL` – Redirect target for `login:portal` users.
- `NEXT_PUBLIC_CRM_PORTAL_URL` – Redirect target for `login:crm` users.
- `NEXT_PUBLIC_DEFAULT_REDIRECT_URL` – Optional catch-all when a user lacks either permission.

## Local development

Install dependencies and run the dev server from the `schl-sso` directory:

```bash
pnpm install
pnpm dev
```

Make sure your `.env.local` points to a locally running instance of the portal API.

## Deployment checklist

1. Deploy `schl-sso` alongside `schl-portal` and `schl-marketers`.
2. Share the same `AUTH_SECRET` across all three apps.
3. Configure a parent-domain cookie (`AUTH_COOKIE_DOMAIN=.domain.com`) so sessions are visible to each subdomain.
4. Update both portal projects to set `SSO_LOGIN_URL` (and equivalent) to the deployed SSO URL.
