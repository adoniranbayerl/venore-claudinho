import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";

export async function writeUserPasswordHash(userId: string, passwordHash: string): Promise<{ id: string } | null> {
  const [row] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  return row ?? null;
}
