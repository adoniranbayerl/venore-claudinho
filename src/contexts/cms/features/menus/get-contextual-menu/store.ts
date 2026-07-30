import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories, entries, menuItems, menus } from "../../../database/schema";
import type { MenuItemRecord } from "../../../contracts/types";
import type { EntryRouteInfo } from "../../../menu-resolution";

export async function findContextualMenus(): Promise<Array<{ id: string; scopePath: string }>> {
  const rows = await db
    .select({ id: menus.id, scopePath: menus.scopePath })
    .from(menus)
    .where(eq(menus.location, "contextual"));

  return rows
    .filter((row): row is { id: string; scopePath: string } => row.scopePath !== null)
    .map((row) => ({ id: row.id, scopePath: row.scopePath }));
}

export async function findMenuItemsByMenuId(menuId: string): Promise<MenuItemRecord[]> {
  const rows = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId));
  return rows as MenuItemRecord[];
}

export async function findEntryRouteInfoByIds(ids: string[]): Promise<Map<string, EntryRouteInfo>> {
  if (ids.length === 0) return new Map();

  const rows = await db
    .select({
      id: entries.id,
      title: entries.title,
      slug: entries.slug,
      status: entries.status,
      categorySlug: categories.slug,
    })
    .from(entries)
    .leftJoin(categories, eq(categories.id, entries.categoryId))
    .where(inArray(entries.id, ids));

  return new Map(rows.map((row) => [row.id, { ...row, categorySlug: row.categorySlug ?? null } as EntryRouteInfo]));
}
