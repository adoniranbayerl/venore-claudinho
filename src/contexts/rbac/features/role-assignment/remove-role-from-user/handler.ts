import { authorizeActor } from "../../../authorize-actor";
import { removeRoleFromUser } from "./service";
import type { RemoveRoleFromUserInput, RemoveRoleFromUserResult } from "./types";

export async function removeRoleFromUserHandler(input: RemoveRoleFromUserInput): Promise<RemoveRoleFromUserResult> {
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

  return removeRoleFromUser({ ...input, actor: { id: authz.actorId } });
}
