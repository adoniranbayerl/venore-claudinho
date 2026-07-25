import { eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems, menus } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";

export async function findOrCreateMenuByLocation(location: string): Promise<{ id: string }> {
  const [existing] = await db.select({ id: menus.id }).from(menus).where(eq(menus.location, location)).limit(1);
  if (existing) {
    return existing;
  }

  const [created] = await db.insert(menus).values({ location }).returning({ id: menus.id });
  return created;
}

export async function findNextMenuItemOrder(menuId: string): Promise<number> {
  const [row] = await db.select({ maxOrder: max(menuItems.order) }).from(menuItems).where(eq(menuItems.menuId, menuId));
  return (row?.maxOrder ?? -1) + 1;
}

export async function insertMenuItem(input: {
  menuId: string;
  label: string;
  href: string;
  order: number;
}): Promise<MenuItemRecord> {
  const [row] = await db
    .insert(menuItems)
    .values({ menuId: input.menuId, label: input.label, href: input.href, order: input.order })
    .returning();

  return row as MenuItemRecord;
}
