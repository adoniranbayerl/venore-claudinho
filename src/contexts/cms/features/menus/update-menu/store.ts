import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menus } from "../../../database/schema";
import type { MenuRecord } from "../../../contracts/types";

export async function findMenuById(id: string): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.id, id)).limit(1);
  return (row as MenuRecord) ?? null;
}

export async function findMenuByScopePath(scopePath: string): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.scopePath, scopePath)).limit(1);
  return (row as MenuRecord) ?? null;
}

export async function updateMenuFields(
  id: string,
  fields: { name?: string; scopePath?: string },
): Promise<MenuRecord> {
  const [row] = await db
    .update(menus)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(menus.id, id))
    .returning();
  return row as MenuRecord;
}
