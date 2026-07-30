import { invalidateCacheByPrefix } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { deleteMenuById, findMenuById } from "./store";
import type { DeleteMenuCommand, DeleteMenuResult } from "./types";

export async function deleteMenu(command: DeleteMenuCommand): Promise<DeleteMenuResult> {
  const handle = beginOperation({
    useCase: "cms.delete-menu",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findMenuById(command.id);
  if (!existing) {
    const error = { code: "cms.menus.not_found", message: `Menu "${command.id}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await deleteMenuById(command.id);

  invalidateCacheByPrefix("cms:navigation");

  endOperation(handle, { success: true });
  return { success: true, data: { id: command.id } };
}
