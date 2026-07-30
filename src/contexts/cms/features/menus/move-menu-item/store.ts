import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";

export async function findMenuItemById(id: string): Promise<MenuItemRecord | null> {
  const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return (row as MenuItemRecord) ?? null;
}

export async function findMenuItemsByMenuId(menuId: string): Promise<MenuItemRecord[]> {
  const rows = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId));
  return rows as MenuItemRecord[];
}

// Reescreve parentId/order de um lote de itens numa única transação — evita ordem inconsistente
// visível entre a atualização do grupo de origem e a do grupo de destino.
export async function applyMenuItemPositions(
  updates: Array<{ id: string; parentId: string | null; order: number }>,
): Promise<MenuItemRecord[]> {
  if (updates.length === 0) return [];

  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(menuItems)
        .set({ parentId: update.parentId, order: update.order, updatedAt: new Date() })
        .where(eq(menuItems.id, update.id));
    }
  });

  const rows = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, updates.map((update) => update.id)));
  return rows as MenuItemRecord[];
}
