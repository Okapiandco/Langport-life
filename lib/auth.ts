import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { client } from "./sanity";

const loginUserQuery = `*[_type == "siteUser" && email == $email][0] {
  _id, userId, name, email, role, status, passwordHash
}`;

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const derivedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === derivedHash;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await client.fetch(loginUserQuery, {
          email: credentials.email,
        });

        if (!user || user.status !== "active") return null;
        if (!user.passwordHash) return null;
        if (!verifyPassword(credentials.password, user.passwordHash)) return null;

        return {
          id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          sanityId: user._id,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.sanityId = (user as unknown as { sanityId: string }).sanityId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { sanityId: string }).sanityId = token.sanityId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
