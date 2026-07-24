import { beginOperation, endOperation } from "@/observability";
import { approveUserRegistration } from "@/contexts/auth";
import { assignRoleToUser } from "../../role-assignment/assign-role-to-user/service";
import { findRoleIdByKey } from "../../role-assignment/assign-default-role/store";
import { defaultRegistrationRoleKey } from "../../role-assignment/assign-default-role/service";
import type { ApproveRegistrationCommand, ApproveRegistrationResult } from "./types";

export async function approveRegistration(command: ApproveRegistrationCommand): Promise<ApproveRegistrationResult> {
  const handle = beginOperation({
    useCase: "rbac.registration-approval.approve-registration",
    actor: { id: command.actor.id, type: "user" },
    kind: "write",
  });

  const approval = await approveUserRegistration({ userId: command.userId });
  if (!approval.success) {
    endOperation(handle, { success: false, error: approval.error });
    return approval;
  }

  let roleId = command.roleId;
  if (!roleId) {
    const roleKey = defaultRegistrationRoleKey();
    const defaultRoleId = await findRoleIdByKey(roleKey);
    if (!defaultRoleId) {
      const error = { code: "rbac.roles.not_found", message: `Papel padrão "${roleKey}" não encontrado.` };
      endOperation(handle, { success: false, error });
      return { success: false, error };
    }
    roleId = defaultRoleId;
  }

  const assignment = await assignRoleToUser({ userId: command.userId, roleId, actor: command.actor });
  if (!assignment.success) {
    endOperation(handle, { success: false, error: assignment.error });
    return assignment;
  }

  endOperation(handle, { success: true });
  return { success: true, data: undefined };
}
