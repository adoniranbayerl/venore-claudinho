import { authorizeActor } from "../../../authorize-actor";
import { removeScopeFromRoleAssignment } from "./service";
import type { RemoveScopeFromRoleAssignmentInput, RemoveScopeFromRoleAssignmentResult } from "./types";

export async function removeScopeFromRoleAssignmentHandler(
  input: RemoveScopeFromRoleAssignmentInput,
): Promise<RemoveScopeFromRoleAssignmentResult> {
  if (
    input.userId.trim().length === 0 ||
    input.roleId.trim().length === 0 ||
    input.scopeType.trim().length === 0 ||
    input.resourceId.trim().length === 0
  ) {
    return {
      success: false,
      error: {
        code: "rbac.scopes.invalid_input",
        message: "userId, roleId, scopeType e resourceId não podem ser vazios.",
      },
    };
  }

  const authz = await authorizeActor("rbac.roles.assign");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return removeScopeFromRoleAssignment({ ...input, actor: { id: authz.actorId } });
}
