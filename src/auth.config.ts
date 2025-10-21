import type { NextAuthConfig } from 'next-auth';
import { baseAuthConfig } from '../shared/auth/config';

export const authConfig: NextAuthConfig = {
  ...baseAuthConfig,
  pages: {
    error: '/login',
    signIn: '/login',
  },
  providers: [], // providers added in src/auth.ts
};
