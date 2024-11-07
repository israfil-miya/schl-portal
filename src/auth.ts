import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
const BASE_URL: string =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface User {
  db_id: string;
  real_name: string;
  cred_name: string;
  role: string;
}

async function getUser(
  username: string,
  password: string,
): Promise<User | null> {
  try {
    const res = await fetch(BASE_URL + '/api/user?action=handle-login', {
      method: 'GET',
      headers: { username: username, password: password },
    });

    if (res.status !== 200) {
      return null;
    }

    const userData = await res.json();

    const user: User = {
      db_id: userData._id,
      real_name: userData.real_name,
      cred_name: userData.name,
      role: userData.role,
    };

    console.log(user);

    return user;
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
      async authorize(credentials) {
        const user = await getUser(
          credentials.username as string,
          credentials.password as string,
        );

        return user ?? null;
      },
    }),
  ],
});
