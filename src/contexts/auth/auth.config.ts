import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { db } from "@/infrastructure/database/client";
import { handleUserRegistered } from "@/platform/registration/handle-user-registered";
import * as schema from "./database/schema";
import { buildAuthProviders } from "./providers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: buildAuthProviders(),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.id ?? token.sub);
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await handleUserRegistered({
        id: user.id!,
        email: user.email ?? null,
        name: user.name ?? null,
      });
    },
  },
});
