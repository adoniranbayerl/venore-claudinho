import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";
import type { UserRegistrationStatus } from "../../../contracts/types";

export async function findUserStatusById(id: string): Promise<UserRegistrationStatus | null> {
  const [user] = await db.select({ status: users.status }).from(users).where(eq(users.id, id)).limit(1);
  return (user?.status as UserRegistrationStatus | undefined) ?? null;
}
