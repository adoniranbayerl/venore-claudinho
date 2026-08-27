import type { DefaultSession } from "next-auth";
import type { UserRegistrationStatus } from "./contracts/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // Preenchido no callback session de auth.config.ts a partir do banco. `undefined` quando
      // ainda não resolvido; "pending" faz getCurrentUser recusar a sessão (P9).
      status?: UserRegistrationStatus;
    } & DefaultSession["user"];
  }
}
