import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PermissionValue } from './app/(pages)/admin/roles/create-role/components/Form';
import { UserSessionType } from './auth';

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
