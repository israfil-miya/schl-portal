import jwt from 'jsonwebtoken';
import type { NextAuthConfig } from 'next-auth';
import type { SharedUserSession } from './types';

const ACCESS_TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes

type AccessTokenPayload = Pick<
  SharedUserSession,
  'db_id' | 'db_role_id' | 'permissions'
>;

function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Missing NEXTAUTH_SECRET / AUTH_SECRET for signing access token',
    );
  }
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(
    {
      sub: payload.db_id,
      role: payload.db_role_id,
      perms: payload.permissions,
    },
    getAuthSecret(),
    { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
  );
}

export const baseAuthConfig: Pick<NextAuthConfig, 'session' | 'callbacks'> = {
  session: {
    strategy: 'jwt',
    maxAge: 10 * 60,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: SharedUserSession }) {
      if (user) {
        token.db_id = user.db_id;
        token.db_role_id = user.db_role_id;
        token.real_name = user.real_name;
        token.permissions = user.permissions;
        token.e_id = user.e_id;

        try {
          token.accessToken = signAccessToken({
            db_id: user.db_id,
            db_role_id: user.db_role_id,
            permissions: user.permissions,
          });
          token.accessTokenExpires =
            Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000;
        } catch (error) {
          console.error('Failed to sign access token', error);
        }
        return token;
      }

      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
        try {
          token.accessToken = signAccessToken({
            db_id: token.db_id!,
            db_role_id: token.db_role_id!,
            permissions: token.permissions || [],
          });
          token.accessTokenExpires =
            Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000;
        } catch (error) {
          console.error('Failed to refresh access token', error);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          db_id: token.db_id,
          db_role_id: token.db_role_id,
          real_name: token.real_name,
          permissions: token.permissions,
          e_id: token.e_id,
        };
        session.accessToken = token.accessToken;
        session.accessTokenExpires = token.accessTokenExpires;
      }
      return session;
    },
  },
};
