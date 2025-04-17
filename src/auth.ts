import mongoose from 'mongoose';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
const BASE_URL: string = process.env.NEXT_PUBLIC_BASE_URL as string;

export interface UserSessionType {
  db_id: string;
  real_name: string;
  cred_name: string;
  role_id: mongoose.Schema.Types.ObjectId;
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

    const user: UserSessionType = {
      db_id: userData._id,
      real_name: userData.real_name,
      cred_name: userData.name,
      role_id: userData.role_id,
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
