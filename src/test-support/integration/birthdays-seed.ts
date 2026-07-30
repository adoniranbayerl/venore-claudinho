// Helper de seed pro teste de integração do plugin birthdays que simula usuário órfão
// (createdByUserId sem FK — schema/index.ts documenta a decisão). Fica fora de
// src/contexts/*/src/plugins/* de propósito, mesmo motivo de academy-seed.ts: precisa apagar
// direto de auth.users, e eslint-plugin-boundaries não classifica este caminho.
import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "@/contexts/auth/database/schema";

export { seedUser } from "./academy-seed";

export async function deleteUser(userId: string): Promise<void> {
  await db.delete(users).where(eq(users.id, userId));
}
