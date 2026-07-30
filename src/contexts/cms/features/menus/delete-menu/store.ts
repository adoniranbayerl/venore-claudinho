import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { menus } from "../../../database/schema";
import type { MenuRecord } from "../../../contracts/types";

export async function findMenuById(id: string): Promise<MenuRecord | null> {
  const [row] = await db.select().from(menus).where(eq(menus.id, id)).limit(1);
  return (row as MenuRecord) ?? null;
}

// FK menu_items.menu_id -> menus.id é ON DELETE CASCADE (schema): apagar o menu já apaga a
// árvore de itens inteira, sem precisar de um passo separado aqui.
export async function deleteMenuById(id: string): Promise<void> {
  await db.delete(menus).where(eq(menus.id, id));
}
