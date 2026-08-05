import { authorizeActor } from "../../../authorize-actor";
import { renameRole } from "./service";
import type { RenameRoleInput, RenameRoleResult } from "./types";

export async function renameRoleHandler(input: RenameRoleInput): Promise<RenameRoleResult> {
  if (input.roleId.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "roleId não pode ser vazio." },
    };
  }

  if (input.name.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_name", message: "O nome do papel não pode ser vazio." },
    };
  }

  const authz = await authorizeActor("rbac.roles.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return renameRole({ ...input, actor: { id: authz.actorId } });
}
