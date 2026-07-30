import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { auth } from "../../../auth.config";
import { users } from "../../../database/schema";

export async function getSession() {
  return auth();
}

export async function findAvatarMediaId(userId: string): Promise<string | null> {
  const [row] = await db.select({ avatarMediaId: users.avatarMediaId }).from(users).where(eq(users.id, userId)).limit(1);
  return row?.avatarMediaId ?? null;
}
