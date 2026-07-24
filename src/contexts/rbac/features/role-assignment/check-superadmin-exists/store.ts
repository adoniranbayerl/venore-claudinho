import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, userRoles } from "../../../database/schema";

export async function superadminAssignmentExists(): Promise<boolean> {
  const [row] = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(eq(roles.key, "superadmin"))
    .limit(1);

  return row !== undefined;
}
