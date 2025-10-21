import { UserSession } from '@shared/auth/types';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

const PORTAL_API_BASE_URL =
  process.env.PORTAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_PORTAL_API_BASE_URL;

if (!PORTAL_API_BASE_URL) {
  throw new Error('PORTAL_API_BASE_URL is not configured for the SSO service.');
}

async function getUser(
  username: string,
  password: string,
): Promise<UserSession | null> {
  try {
    const res = await fetch(
      `${PORTAL_API_BASE_URL}/api/user?action=handle-login`,
      {
        method: 'GET',
        headers: { username, password },
      },
    );

    if (res.status !== 200) {
      return null;
    }

    const data = await res.json();
    return {
      db_id: data._id,
      db_role_id: data.role_id._id,
      permissions: data.role_id.permissions || [],
      real_name: data.employee_id.real_name,
      e_id: data.employee_id.e_id,
    };
  } catch (error) {
    console.error('Failed to fetch user', error);
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
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = (await getUser(
          credentials?.username as string,
          credentials?.password as string,
        )) as unknown as UserSession | null;
        return (user ?? null) as any;
      },
    }),
  ],
});
