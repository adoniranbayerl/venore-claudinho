import { authorizeActor } from "../../../authorize-actor";
import { assignScopeToRoleAssignment } from "./service";
import type { AssignScopeToRoleAssignmentInput, AssignScopeToRoleAssignmentResult } from "./types";

export async function assignScopeToRoleAssignmentHandler(
  input: AssignScopeToRoleAssignmentInput,
): Promise<AssignScopeToRoleAssignmentResult> {
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

  return assignScopeToRoleAssignment({ ...input, actor: { id: authz.actorId } });
}
