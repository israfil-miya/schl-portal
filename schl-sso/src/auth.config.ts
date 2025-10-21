import { baseAuthConfig } from '@shared/auth/config';
import type { NextAuthConfig } from 'next-auth';

function buildCookieConfig(): Pick<NextAuthConfig, 'cookies'> {
  const domain = process.env.AUTH_COOKIE_DOMAIN;

  if (!domain) {
    return {};
  }

  const secure = process.env.NODE_ENV === 'production';

  return {
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token',
        options: {
          domain,
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure,
        },
      },
      callbackUrl: {
        name: 'next-auth.callback-url',
        options: {
          domain,
          httpOnly: false,
          path: '/',
          sameSite: 'lax',
          secure,
        },
      },
      csrfToken: {
        name: 'next-auth.csrf-token',
        options: {
          domain,
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure,
        },
      },
    },
  };
}

export const authConfig: NextAuthConfig = {
  ...baseAuthConfig,
  ...buildCookieConfig(),
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [],
};
