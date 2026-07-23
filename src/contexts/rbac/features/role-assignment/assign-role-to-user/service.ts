import { beginOperation, endOperation } from "@/observability";
import { invalidateUserContext } from "../../../user-context-cache";
import { roleExists, insertUserRole } from "./store";
import type { AssignRoleToUserCommand, AssignRoleToUserResult } from "./types";

export async function assignRoleToUser(command: AssignRoleToUserCommand): Promise<AssignRoleToUserResult> {
  const handle = beginOperation({
    useCase: "rbac.role-assignment.assign-role-to-user",
    actor: { id: command.actor.id, type: "user" },
    kind: "write",
  });

  const exists = await roleExists(command.roleId);
  if (!exists) {
    const error = { code: "rbac.roles.not_found", message: `Papel "${command.roleId}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertUserRole(command.userId, command.roleId);
  invalidateUserContext(command.userId);

  endOperation(handle, { success: true });

  return { success: true, data: undefined };
}
