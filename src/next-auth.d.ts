import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { UserSessionType } from './auth';
import { PermissionValue } from './permissions';

// Extend the default User type
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: UserSessionType;
    accessToken?: string;
    accessTokenExpires?: number; // epoch ms
  }

  interface User {
    db_id: string;
    db_role_id: string;
    permissions: PermissionValue[];
    real_name: string;
    e_id: string;
  }
}

// Extend the JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    db_id: string;
    db_role_id: string;
    permissions: PermissionValue[];
    real_name: string;
    e_id: string;
    accessToken?: string;
    accessTokenExpires?: number; // epoch ms
  }
}
