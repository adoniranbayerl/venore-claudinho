import { and, asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";

export async function findMenuItemsByMenuId(menuId: string): Promise<MenuItemRecord[]> {
  const rows = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId)).orderBy(asc(menuItems.order));
  return rows as MenuItemRecord[];
}

export async function updateMenuItemsOrder(menuId: string, orderedIds: string[]): Promise<MenuItemRecord[]> {
  return db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(menuItems)
        .set({ order: index })
        .where(and(eq(menuItems.id, id), eq(menuItems.menuId, menuId)));
    }

    const rows = await tx.select().from(menuItems).where(eq(menuItems.menuId, menuId)).orderBy(asc(menuItems.order));
    return rows as MenuItemRecord[];
  });
}
