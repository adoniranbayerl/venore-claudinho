import { authorizeActor } from "../../../authorize-actor";
import { assignRoleToUser } from "./service";
import type { AssignRoleToUserInput, AssignRoleToUserResult } from "./types";

export async function assignRoleToUserHandler(input: AssignRoleToUserInput): Promise<AssignRoleToUserResult> {
  if (input.userId.trim().length === 0 || input.roleId.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_id", message: "userId e roleId não podem ser vazios." },
    };
  }

  const authz = await authorizeActor("rbac.roles.assign");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return assignRoleToUser({ ...input, actor: { id: authz.actorId } });
}
