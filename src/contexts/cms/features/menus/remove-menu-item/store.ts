import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menuItems } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";

export async function findMenuItemById(id: string): Promise<MenuItemRecord | null> {
  const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return (row as MenuItemRecord) ?? null;
}

// FK menu_items.parent_id -> menu_items.id é ON DELETE CASCADE (schema): apagar um item já
// apaga a subárvore inteira dele, decisão explícita — remover um grupo remove o que está
// agrupado nele, não promove os filhos pra cima.
export async function deleteMenuItemById(id: string): Promise<void> {
  await db.delete(menuItems).where(eq(menuItems.id, id));
}
