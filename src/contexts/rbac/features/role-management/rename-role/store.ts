import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, userRoles } from "../../../database/schema";

export async function findRoleById(roleId: string) {
  const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
  return role ?? null;
}

export async function findUserIdsWithRole(roleId: string): Promise<string[]> {
  const rows = await db.select({ userId: userRoles.userId }).from(userRoles).where(eq(userRoles.roleId, roleId));
  return rows.map((row) => row.userId);
}

export async function updateRoleName(roleId: string, name: string) {
  const [role] = await db.update(roles).set({ name, updatedAt: new Date() }).where(eq(roles.id, roleId)).returning();
  return role;
}
