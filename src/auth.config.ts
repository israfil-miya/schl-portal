import jwt from 'jsonwebtoken';
import type { NextAuthConfig } from 'next-auth';
import { UserSessionType } from './auth';

// Access token lifetime (short-lived, exposed to frontend). Keep it short to reduce XSS blast radius.
const ACCESS_TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes

function signAccessToken(
  payload: Pick<UserSessionType, 'db_id' | 'role' | 'permissions'>,
) {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret)
    throw new Error(
      'Missing NEXTAUTH_SECRET / AUTH_SECRET for signing access token',
    );
  return jwt.sign(
    {
      sub: payload.db_id,
      role: payload.role,
      perms: payload.permissions,
    },
    secret,
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
  );
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt', // session stored in secure, HttpOnly JWT cookie
    maxAge: 10 * 60, // 10 minutes
  },
  pages: {
    error: '/login',
    signIn: '/login',
  },
  callbacks: {
    // attach user data to JWT cookie
    async jwt({ token, user }) {
      // Initial sign-in: copy user info + create short-lived access token
      if (user) {
        token.db_id = (user as any).db_id;
        token.real_name = (user as any).real_name;
        token.cred_name = (user as any).cred_name;
        token.permissions = (user as any).permissions;
        token.role = (user as any).role;
        token.db_role_id = (user as any).db_role_id;

        try {
          token.accessToken = signAccessToken({
            db_id: (user as any).db_id,
            role: (user as any).role,
            permissions: (user as any).permissions,
          });
          token.accessTokenExpires =
            Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000;
        } catch (e) {
          console.error('Failed to sign access token', e);
        }
        return token;
      }

      // Subsequent calls: rotate if expired (silent refresh on usage)
      if (
        token.accessTokenExpires &&
        Date.now() > (token.accessTokenExpires as number)
      ) {
        try {
          token.accessToken = signAccessToken({
            db_id: token.db_id as string,
            role: token.role as string,
            permissions: (token.permissions as any) || [],
          });
          token.accessTokenExpires =
            Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000;
        } catch (e) {
          console.error('Failed to refresh access token', e);
        }
      }
      return token;
    },
    // session exposed to frontend via useSession()
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          db_id: token.db_id,
          real_name: token.real_name,
          cred_name: token.cred_name,
          permissions: token.permissions,
          role: token.role,
          db_role_id: token.db_role_id,
        };
        session.accessToken = token.accessToken; // expose short-lived access token
        session.accessTokenExpires = token.accessTokenExpires;
      }
      return session;
    },
  },
  providers: [], // providers added in src/auth.ts
};
