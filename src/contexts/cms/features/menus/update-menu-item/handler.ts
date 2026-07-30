import { authorizeActor } from "@/contexts/rbac";
import { updateMenuItem } from "./service";
import type { UpdateMenuItemInput, UpdateMenuItemResult } from "./types";

export async function updateMenuItemHandler(input: UpdateMenuItemInput): Promise<UpdateMenuItemResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_id", message: "id do item não pode ser vazio." } };
  }

  if (input.label !== undefined && input.label.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_label", message: "O label não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateMenuItem({ ...input, actorId: authz.actorId });
}
