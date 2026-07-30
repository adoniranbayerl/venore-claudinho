import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";

export async function updateAvatarMediaId(
  userId: string,
  avatarMediaId: string | null,
): Promise<{ id: string; avatarMediaId: string | null }> {
  const [row] = await db
    .update(users)
    .set({ avatarMediaId })
    .where(eq(users.id, userId))
    .returning({ id: users.id, avatarMediaId: users.avatarMediaId });

  return row;
}
