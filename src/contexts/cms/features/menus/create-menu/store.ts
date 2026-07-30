import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menus } from "../../../database/schema";
import type { MenuLocation, MenuRecord } from "../../../contracts/types";

export async function findMenuByKey(key: string): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.key, key)).limit(1);
  return (row as MenuRecord) ?? null;
}

export async function findMenuByLocation(location: MenuLocation): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.location, location)).limit(1);
  return (row as MenuRecord) ?? null;
}

export async function findMenuByScopePath(scopePath: string): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.scopePath, scopePath)).limit(1);
  return (row as MenuRecord) ?? null;
}

export async function insertMenu(input: {
  key: string;
  name: string;
  location: MenuLocation;
  scopePath: string | null;
}): Promise<MenuRecord> {
  const [row] = await db.insert(menus).values(input).returning();
  return row as MenuRecord;
}
