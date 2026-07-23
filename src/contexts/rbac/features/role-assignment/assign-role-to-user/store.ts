import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, userRoles } from "../../../database/schema";

export async function roleExists(roleId: string): Promise<boolean> {
  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.id, roleId)).limit(1);
  return role !== undefined;
}

export async function insertUserRole(userId: string, roleId: string): Promise<void> {
  await db
    .insert(userRoles)
    .values({ userId, roleId })
    .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] });
}
