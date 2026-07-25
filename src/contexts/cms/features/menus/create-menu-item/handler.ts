import { authorizeActor } from "@/contexts/rbac";
import { createMenuItem } from "./service";
import type { CreateMenuItemInput, CreateMenuItemResult } from "./types";

export async function createMenuItemHandler(input: CreateMenuItemInput): Promise<CreateMenuItemResult> {
  if (input.location.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_location", message: "location não pode ser vazio." } };
  }

  if (input.label.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_label", message: "O label do item de menu não pode ser vazio." },
    };
  }

  if (input.href.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_href", message: "O href do item de menu não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createMenuItem({ ...input, actorId: authz.actorId });
}
