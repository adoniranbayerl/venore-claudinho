import { authorizeActor } from "../../../authorize-actor";
import { listRoles } from "./service";
import type { ListRolesResult } from "./types";

export async function listRolesHandler(): Promise<ListRolesResult> {
  const authz = await authorizeActor("rbac.roles.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listRoles();
}
