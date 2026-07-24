import { beginOperation, endOperation } from "@/observability";
import { invalidateUserContext } from "../../../user-context-cache";
import { insertUserRole } from "../assign-role-to-user/store";
import { findRoleIdByKey } from "../assign-default-role/store";
import type { GrantSuperadminInput, GrantSuperadminResult } from "./types";

export async function grantSuperadmin(command: GrantSuperadminInput): Promise<GrantSuperadminResult> {
  const handle = beginOperation({
    useCase: "rbac.role-assignment.grant-superadmin",
    actor: { id: command.userId, type: "system" },
    kind: "write",
  });

  const roleId = await findRoleIdByKey("superadmin");
  if (!roleId) {
    const error = {
      code: "rbac.roles.superadmin_role_missing",
      message: 'Papel "superadmin" não encontrado — confirme que as migrations do core foram aplicadas.',
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  await insertUserRole(command.userId, roleId);
  invalidateUserContext(command.userId);
  endOperation(handle, { success: true });
  return { success: true, data: undefined };
}
