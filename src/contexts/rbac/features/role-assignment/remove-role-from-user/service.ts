import { beginOperation, endOperation } from "@/observability";
import { invalidateUserContext } from "../../../user-context-cache";
import { deleteUserRole } from "./store";
import type { RemoveRoleFromUserCommand, RemoveRoleFromUserResult } from "./types";

export async function removeRoleFromUser(command: RemoveRoleFromUserCommand): Promise<RemoveRoleFromUserResult> {
  const handle = beginOperation({
    useCase: "rbac.role-assignment.remove-role-from-user",
    actor: { id: command.actor.id, type: "user" },
    kind: "write",
  });

  await deleteUserRole(command.userId, command.roleId);
  invalidateUserContext(command.userId);

  endOperation(handle, { success: true });

  return { success: true, data: undefined };
}
