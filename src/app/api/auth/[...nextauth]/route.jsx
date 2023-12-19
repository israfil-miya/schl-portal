import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { headers } from "next/headers";

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    CredentialsProvider({
      id: "signin",
      async authorize(credentials) {
        const { name, password } = credentials;
        if (!name || !password) return null;

        const res = await fetch(
          process.env.NEXT_PUBLIC_BASE_URL + "/api/user/signin",
          {
            method: "GET",
            headers: {
              name,
              password,
            },
          },
        );

        console.log("BEFORE: ", res);

        const user = await res.json();

        console.log("AFTER: ", user);

        if (user && !user.error) {
          /*
          const decryptedPass = await verifyPassword(password, user.password)
          if (!decryptedPass) return null
          */
          return user;
        }
        throw new Error(user.message);
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  jwt: {
    encryption: true,
  },

  callbacks: {
    async session({ session, token, user }) {
      const sanitizedToken = Object.keys(token).reduce((p, c) => {
        // strip unnecessary properties
        if (c !== "iat" && c !== "exp" && c !== "jti" && c !== "apiToken") {
          return { ...p, [c]: token[c] };
        } else {
          return p;
        }
      }, {});
      return { ...session, user: sanitizedToken, apiToken: token.apiToken };
    },
    async jwt({ token, user, account, profile }) {
      if (typeof user !== "undefined") {
        // user has just signed in so the user object is populated
        return user;
      }
      return token;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
