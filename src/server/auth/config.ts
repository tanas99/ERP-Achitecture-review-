import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/server/db";
import { passwordHasher } from "@/server/auth/password";
import type { Role } from "@/server/auth/capabilities";

/**
 * Auth.js (NextAuth v5) configuration (ARCHITECTURE.md §5).
 *
 * Session strategy: JWT. NOTE / trade-off — the Credentials provider in Auth.js
 * only supports the JWT session strategy out of the box; the DB-session
 * revocation described in the architecture will be layered on later via a custom
 * session store. The token carries userId, companyId and roles, which feed the
 * request context, authorization and the tenant guard.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string;
      roles: Role[];
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          include: { roles: { include: { role: true } } },
        });
        if (!user || !user.isActive || !user.passwordHash) return null;

        const valid = await passwordHasher.verify(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          companyId: user.companyId,
          roles: user.roles.map((ur) => ur.role.name as Role),
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.companyId = (user as { companyId: string }).companyId;
        token.roles = (user as { roles: Role[] }).roles;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.companyId = token.companyId as string;
      session.user.roles = (token.roles as Role[]) ?? [];
      return session;
    },
  },
});
