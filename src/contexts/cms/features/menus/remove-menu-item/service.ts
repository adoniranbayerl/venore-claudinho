import { beginOperation, endOperation } from "@/observability";
import { deleteMenuItemById, findMenuItemById } from "./store";
import type { RemoveMenuItemCommand, RemoveMenuItemResult } from "./types";

export async function removeMenuItem(command: RemoveMenuItemCommand): Promise<RemoveMenuItemResult> {
  const handle = beginOperation({
    useCase: "cms.remove-menu-item",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const item = await findMenuItemById(command.menuItemId);
  if (!item) {
    const error = {
      code: "cms.menus.item_not_found",
      message: `Nenhum item de menu encontrado com id "${command.menuItemId}".`,
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteMenuItemById(command.menuItemId);

  endOperation(handle, { success: true });
  return { success: true, data: { id: command.menuItemId } };
}
