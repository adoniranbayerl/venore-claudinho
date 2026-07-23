import { authorizeActor } from "../../../authorize-actor";
import { updateRolePermissions } from "./service";
import type { UpdateRolePermissionsInput, UpdateRolePermissionsResult } from "./types";

export async function updateRolePermissionsHandler(input: UpdateRolePermissionsInput): Promise<UpdateRolePermissionsResult> {
  if (input.roleId.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "roleId não pode ser vazio." },
    };
  }

  if (!Array.isArray(input.permissionKeys)) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_permissions", message: "permissionKeys deve ser um array." },
    };
  }

  const authz = await authorizeActor("rbac.roles.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateRolePermissions({ ...input, actor: { id: authz.actorId } });
}
