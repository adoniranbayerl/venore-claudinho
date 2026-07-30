import { authorizeActor } from "@/contexts/rbac";
import { createMenuItem } from "./service";
import type { CreateMenuItemInput, CreateMenuItemResult } from "./types";

export async function createMenuItemHandler(input: CreateMenuItemInput): Promise<CreateMenuItemResult> {
  if (input.menuId.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_menu_id", message: "menuId não pode ser vazio." } };
  }

  if (input.label.trim().length === 0) {
    return {
      success: false,
      error: { code: "cms.menus.invalid_label", message: "O label do item de menu não pode ser vazio." },
    };
  }

  if (input.target.targetType === "content" && input.target.contentId.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_target", message: "contentId não pode ser vazio." } };
  }

  if (input.target.targetType === "route" && input.target.routePath.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_target", message: "routePath não pode ser vazio." } };
  }

  if (input.target.targetType === "external" && input.target.externalUrl.trim().length === 0) {
    return { success: false, error: { code: "cms.menus.invalid_target", message: "externalUrl não pode ser vazio." } };
  }

  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createMenuItem({ ...input, actorId: authz.actorId });
}
