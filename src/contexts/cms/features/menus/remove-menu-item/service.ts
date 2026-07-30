import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { deleteMenuItemById, findMenuItemById } from "./store";
import type { RemoveMenuItemCommand, RemoveMenuItemResult } from "./types";

export async function removeMenuItem(command: RemoveMenuItemCommand): Promise<RemoveMenuItemResult> {
  const handle = beginOperation({
    useCase: "cms.remove-menu-item",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findMenuItemById(command.id);
  if (!existing) {
    const error = { code: "cms.menus.item_not_found", message: `Item de menu "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteMenuItemById(command.id);

  invalidateCacheByPrefix("cms:navigation");

  endOperation(handle, { success: true });
  return { success: true, data: { id: command.id } };
}
