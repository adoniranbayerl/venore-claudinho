import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { userRoles } from "../../../database/schema";

export async function findUserIdsWithRole(roleId: string): Promise<string[]> {
  const rows = await db.select({ userId: userRoles.userId }).from(userRoles).where(eq(userRoles.roleId, roleId));
  return rows.map((row) => row.userId);
}
