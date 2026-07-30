import { authorizeActor } from "@/contexts/rbac";
import { moveMenuItem } from "./service";
import type { MoveMenuItemInput, MoveMenuItemResult } from "./types";

export async function moveMenuItemHandler(input: MoveMenuItemInput): Promise<MoveMenuItemResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_id", message: "id do item não pode ser vazio." } };
  }

  if (input.parentId === input.id) {
    return {
      success: false,
      error: { code: "cms.menus.cycle_detected", message: "Um item de menu não pode ser pai de si mesmo." },
    };
  }

  if (!Number.isInteger(input.order) || input.order < 0) {
    return { success: false, error: { code: "cms.menus.invalid_order", message: "order deve ser um inteiro >= 0." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return moveMenuItem({ ...input, actorId: authz.actorId });
}
