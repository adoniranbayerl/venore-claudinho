import { beginOperation, endOperation } from "@/observability";
import { findMenuItemsByMenuId, updateMenuItemsOrder } from "./store";
import type { ReorderMenuItemsCommand, ReorderMenuItemsResult } from "./types";

export async function reorderMenuItems(command: ReorderMenuItemsCommand): Promise<ReorderMenuItemsResult> {
  const handle = beginOperation({
    useCase: "cms.reorder-menu-items",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findMenuItemsByMenuId(command.menuId);
  const existingIds = new Set(existing.map((item) => item.id));
  const incomingIds = new Set(command.menuItemIds);

  const sameSet =
    existingIds.size === incomingIds.size && [...existingIds].every((id) => incomingIds.has(id));
  if (!sameSet) {
    const error = {
      code: "cms.menus.reorder_mismatch",
      message: "A lista de itens para reordenar não corresponde aos itens atuais do menu.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const items = await updateMenuItemsOrder(command.menuId, command.menuItemIds);

  endOperation(handle, { success: true });
  return { success: true, data: items };
}
