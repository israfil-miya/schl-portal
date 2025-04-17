import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { UserSessionType } from './auth';

// Extend the default User type
declare module 'next-auth' {
  interface Session {
    user: UserSessionType;
    // & DefaultSession['user'];
  }

  interface User {
    db_id: string;
    real_name: string | null;
    cred_name: string;
    role_id: mongoose.Schema.Types.ObjectId;
  }
}

// Extend the JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    db_id: string;
    real_name: string | null;
    cred_name: string;
    role_id: mongoose.Schema.Types.ObjectId;
  }
}
