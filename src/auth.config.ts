import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    error: '/login',
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      // When a user logs in, attach user data to the token
      if (user) {
        token.db_id = user.db_id;
        token.real_name = user.real_name;
        token.cred_name = user.cred_name;
        token.permissions = user?.permissions;
        token.role = user?.role;
        token.db_role_id = user?.db_role_id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Attach token data to the session
      if (token) {
        session.user.db_id = token.db_id;
        session.user.real_name = token.real_name;
        session.user.cred_name = token.cred_name;
        session.user.permissions = token.permissions;
        session.user.role = token.role;
        session.user.db_role_id = token.db_role_id;
      }
      return session;
    },
    authorized({ auth }: { auth: any }) {
      const isAuthenticated = !!auth?.user;

      return isAuthenticated;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
