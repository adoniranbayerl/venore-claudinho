import { authorizeActor } from "@/contexts/rbac";
import { removeMenuItem } from "./service";
import type { RemoveMenuItemInput, RemoveMenuItemResult } from "./types";

export async function removeMenuItemHandler(input: RemoveMenuItemInput): Promise<RemoveMenuItemResult> {
  if (input.id.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_id", message: "id do item não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return removeMenuItem({ ...input, actorId: authz.actorId });
}
