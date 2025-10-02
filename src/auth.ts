import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PermissionValue } from './app/(pages)/admin/roles/create-role/components/Form';
import { authConfig } from './auth.config';

const ACCESS_TOKEN_EXPIRES = '15m'; // short-lived
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;

export interface UserSessionType {
  db_id: string;
  real_name: string | null;
  cred_name: string;
  permissions: PermissionValue[];
  role: string;
  db_role_id: string;
  accessToken: string;
}

async function getUser(
  username: string,
  password: string,
): Promise<UserSessionType | null> {
  try {
    const res = await fetch(BASE_URL + '/api/user?action=handle-login', {
      method: 'GET',
      headers: { username: username, password: password },
    });

    if (res.status !== 200) {
      return null;
    }

    const userData = await res.json();

    const user = {
      db_id: userData._id,
      real_name: userData.real_name,
      cred_name: userData.name,
      permissions: userData.role_id.permissions || [],
      role: userData.role_id.name,
      db_role_id: userData.role_id._id,
    };

    const accessToken = jwt.sign(
      {
        db_id: user.db_id,
        real_name: user.real_name,
        cred_name: user.cred_name,
        permissions: user.permissions,
        role: user.role,
        db_role_id: user.db_role_id,
      },
      process.env.AUTH_SECRET as string,
      { expiresIn: ACCESS_TOKEN_EXPIRES },
    );

    return { ...user, accessToken };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials, _request) {
        const user = await getUser(
          credentials.username as string,
          credentials.password as string,
        );

        return user ?? null;
      },
    }),
  ],
});
