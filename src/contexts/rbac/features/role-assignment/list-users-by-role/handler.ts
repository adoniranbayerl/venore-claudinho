import { authorizeActor } from "../../../authorize-actor";
import { listUsersByRole } from "./service";
import type { ListUsersByRoleInput, ListUsersByRoleResult } from "./types";

export async function listUsersByRoleHandler(input: ListUsersByRoleInput): Promise<ListUsersByRoleResult> {
  if (input.roleId.trim().length === 0) {
    return { success: false, error: { code: "rbac.roles.invalid_id", message: "roleId não pode ser vazio." } };
  }

  const authz = await authorizeActor("rbac.roles.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listUsersByRole(input);
}
