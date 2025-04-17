import mongoose from 'mongoose';
import type { NextAuthConfig } from 'next-auth';
import { dbConnect } from './lib/utils';
import Role from './models/Roles';
dbConnect();

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
        const role = await Role.findOne({
          _id: String(user.role_id as mongoose.Schema.Types.ObjectId),
        });

        token.db_id = user.db_id;
        token.cred_name = user.cred_name;
        token.real_name = user.real_name;
        token.role = role?.name;
        token.permissions = role?.permissions || [];
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Attach token data to the session
      if (token) {
        session.user.db_id = token.db_id;
        session.user.cred_name = token.cred_name;
        session.user.real_name = token.real_name;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
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
