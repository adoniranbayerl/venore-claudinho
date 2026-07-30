import { authorizeActor } from "@/contexts/rbac";
import { deleteMenu } from "./service";
import type { DeleteMenuInput, DeleteMenuResult } from "./types";

export async function deleteMenuHandler(input: DeleteMenuInput): Promise<DeleteMenuResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_id", message: "id do menu não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteMenu({ ...input, actorId: authz.actorId });
}
