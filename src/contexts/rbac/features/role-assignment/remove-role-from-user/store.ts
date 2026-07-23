import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { userRoles } from "../../../database/schema";

export async function deleteUserRole(userId: string, roleId: string): Promise<void> {
  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
}
