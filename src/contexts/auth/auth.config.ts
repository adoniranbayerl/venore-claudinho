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
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
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
