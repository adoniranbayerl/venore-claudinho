import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { users } from "../../../database/schema";
import type { UserRegistrationStatus } from "../../../contracts/types";

export async function updateUserStatus(userId: string, status: UserRegistrationStatus): Promise<void> {
  await db.update(users).set({ status }).where(eq(users.id, userId));
}
