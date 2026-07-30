import { resolveAdminMenuTree } from "../../../menu-resolution";
import type { MenuItemRecord } from "../../../contracts/types";
import { findEntryRouteInfoByIds, findMenuById, findMenuItemsByMenuId } from "./store";
import type { GetMenuTreeQuery, GetMenuTreeResult } from "./types";

function isContentItem(item: MenuItemRecord): item is MenuItemRecord & { targetType: "content"; contentId: string } {
  return item.targetType === "content";
}

export async function getMenuTree(query: GetMenuTreeQuery): Promise<GetMenuTreeResult> {
  const menu = await findMenuById(query.menuId);
  if (!menu) {
    return { success: false, error: { code: "cms.menus.not_found", message: `Menu "${query.menuId}" não encontrado.` } };
  }

  const rawItems = await findMenuItemsByMenuId(query.menuId);
  const contentIds = rawItems.filter(isContentItem).map((item) => item.contentId);
  const entriesById = await findEntryRouteInfoByIds(contentIds);

  const items = resolveAdminMenuTree(rawItems, entriesById);

  return { success: true, data: { menu, items } };
}
