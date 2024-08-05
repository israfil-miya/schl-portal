import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extend the default User type
declare module 'next-auth' {
  interface Session {
    user: {
      db_id: string;
      real_name: string | null;
      cred_name: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    db_id: string;
    real_name: string | null;
    cred_name: string;
    role: string;
  }
}

// Extend the JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    db_id: string;
    real_name: string | null;
    cred_name: string;
    role: string;
  }
}
