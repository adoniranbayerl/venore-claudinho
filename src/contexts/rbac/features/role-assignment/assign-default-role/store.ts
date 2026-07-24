import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles } from "../../../database/schema";

export async function findRoleIdByKey(key: string): Promise<string | null> {
  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.key, key)).limit(1);
  return role?.id ?? null;
}
