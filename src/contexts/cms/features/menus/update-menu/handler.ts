import { authorizeActor } from "@/contexts/rbac";
import { updateMenu } from "./service";
import type { UpdateMenuInput, UpdateMenuResult } from "./types";

export async function updateMenuHandler(input: UpdateMenuInput): Promise<UpdateMenuResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_id", message: "id do menu não pode ser vazio." } };
  }

  if (input.name !== undefined && input.name.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_name", message: "O nome do menu não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateMenu({ ...input, actorId: authz.actorId });
}
