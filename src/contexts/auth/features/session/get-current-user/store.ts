import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { auth } from "../../../auth.config";
import { users } from "../../../database/schema";

// cache() memoiza por request: getCurrentUserService (via getAdminPageData) e
// getCurrentUserRegistrationStatusService chamam isso de forma independente no mesmo request
// (ambos disparados por src/app/(platform)/layout.tsx), e sem memoização isso era 2 leituras de
// sessão (JWT/DB) por página em vez de 1 — mesmo padrão de resolve-active-theme.ts.
export const getSession = cache(async () => {
  return auth();
});

export async function findAvatarMediaId(userId: string): Promise<string | null> {
  const [row] = await db.select({ avatarMediaId: users.avatarMediaId }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.avatarMediaId ?? null;
}
