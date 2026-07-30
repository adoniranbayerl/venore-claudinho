import { authorizeActor } from "@/contexts/rbac";
import { listMenus } from "./service";
import type { ListMenusResult } from "./types";

// Lista todos os menus, inclusive os sem item ainda — usado só pelo admin (index do construtor),
// por isso exige a mesma permission de gerenciar menus.
export async function listMenusHandler(): Promise<ListMenusResult> {
  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listMenus();
}
