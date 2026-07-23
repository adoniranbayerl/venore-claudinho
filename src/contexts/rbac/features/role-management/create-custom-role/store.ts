import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { roles, rolePermissions } from "../../../database/schema";

export async function findRoleByKey(key: string) {
  const [role] = await db.select().from(roles).where(eq(roles.key, key)).limit(1);
  return role ?? null;
}

export async function insertRoleWithPermissions(input: {
  key: string;
  name: string;
  permissionKeys: string[];
}) {
  return db.transaction(async (tx) => {
    const [role] = await tx
      .insert(roles)
      .values({ key: input.key, name: input.name, isSystem: false })
      .returning();

    if (input.permissionKeys.length > 0) {
      await tx.insert(rolePermissions).values(
        input.permissionKeys.map((permissionKey) => ({
          roleId: role.id,
          permissionKey,
        })),
      );
    }

    return role;
  });
}
