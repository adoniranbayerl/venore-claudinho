import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems, menus } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";

export async function findMenuByLocation(location: string): Promise<{ id: string } | null> {
  const [row] = await db.select({ id: menus.id }).from(menus).where(eq(menus.location, location)).limit(1);
  return row ?? null;
}

export async function findMenuItemsByMenuId(menuId: string): Promise<MenuItemRecord[]> {
  const rows = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId)).orderBy(asc(menuItems.order));
  return rows as MenuItemRecord[];
}
