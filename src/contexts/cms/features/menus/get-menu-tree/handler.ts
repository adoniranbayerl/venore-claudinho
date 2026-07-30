import { authorizeActor } from "@/contexts/rbac";
import { getMenuTree } from "./service";
import type { GetMenuTreeQuery, GetMenuTreeResult } from "./types";

export async function getMenuTreeHandler(query: GetMenuTreeQuery): Promise<GetMenuTreeResult> {
  const authz = await authorizeActor("cms.menus.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return getMenuTree(query);
}
