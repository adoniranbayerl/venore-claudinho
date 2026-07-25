import { authorizeActor } from "@/contexts/rbac";
import { reorderMenuItems } from "./service";
import type { ReorderMenuItemsInput, ReorderMenuItemsResult } from "./types";

export async function reorderMenuItemsHandler(input: ReorderMenuItemsInput): Promise<ReorderMenuItemsResult> {
  if (input.menuId.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_menu_id", message: "menuId não pode ser vazio." } };
  }

  if (input.menuItemIds.length === 0) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_menu_item_ids", message: "A lista de itens não pode ser vazia." },
    };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return reorderMenuItems({ ...input, actorId: authz.actorId });
}
