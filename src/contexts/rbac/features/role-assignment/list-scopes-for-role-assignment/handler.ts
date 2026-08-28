import { authorizeActor } from "../../../authorize-actor";
import { listScopesForRoleAssignment } from "./service";
import type { ListScopesForRoleAssignmentInput, ListScopesForRoleAssignmentResult } from "./types";

export async function listScopesForRoleAssignmentHandler(
  input: ListScopesForRoleAssignmentInput,
): Promise<ListScopesForRoleAssignmentResult> {
  if (input.userId.trim().length === 0 || input.roleId.trim().length === 0) {
    return {
      success: false,
      error: { code: "rbac.scopes.invalid_input", message: "userId e roleId não podem ser vazios." },
    };
  }

  const authz = await authorizeActor("rbac.roles.assign");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listScopesForRoleAssignment(input);
}
