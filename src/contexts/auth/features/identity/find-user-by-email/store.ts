import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, image: users.image, avatarMediaId: users.avatarMediaId })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}
