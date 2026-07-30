import { asc, count, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems, menus } from "../../../database/schema";
import type { MenuRecord } from "../../../contracts/types";

export async function findAllMenusWithItemCount(): Promise<Array<MenuRecord & { itemCount: number }>> {
  const rows = await db
    .select({ menu: menus, itemCount: count(menuItems.id) })
    .from(menus)
    .leftJoin(menuItems, eq(menuItems.menuId, menus.id))
    .groupBy(menus.id)
    .orderBy(asc(menus.location), asc(menus.name));

  return rows.map((row) => ({ ...(row.menu as MenuRecord), itemCount: row.itemCount }));
}
