import { beginOperation, endOperation, recordAuditEvent } from "@/observability";
import { invalidateUserContext } from "../../../user-context-cache";
import { findRoleById, findUserIdsWithRole, replaceRolePermissions } from "./store";
import { toRoleRef } from "./view";
import type { UpdateRolePermissionsCommand, UpdateRolePermissionsResult } from "./types";

export async function updateRolePermissions(command: UpdateRolePermissionsCommand): Promise<UpdateRolePermissionsResult> {
  const handle = beginOperation({
    useCase: "rbac.role-management.update-role-permissions",
    actor: { id: command.actor.id, type: "user" },
    kind: "write",
  });

  const role = await findRoleById(command.roleId);
  if (!role) {
    const error = { code: "rbac.roles.not_found", message: `Papel "${command.roleId}" não encontrado.` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  if (role.key === "superadmin") {
    const error = {
      code: "rbac.roles.superadmin_immutable",
      message: "As permissions do papel superadmin não podem ser editadas — o acesso é irrestrito por definição.",
    };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const updated = await replaceRolePermissions(command.roleId, command.permissionKeys);

  const affectedUserIds = await findUserIdsWithRole(command.roleId);
  for (const userId of affectedUserIds) {
    invalidateUserContext(userId);
  }

  const summary = `user:${command.actor.id} alterou as permissions do papel "${role.key}" (${command.permissionKeys.length} permission${command.permissionKeys.length === 1 ? "" : "s"}), afetando ${affectedUserIds.length} usuário${affectedUserIds.length === 1 ? "" : "s"}.`;
  endOperation(handle, { success: true, summary, detail: { roleId: command.roleId, permissionKeys: command.permissionKeys } });

  await recordAuditEvent({
    action: "rbac.update-role-permissions",
    actor: { id: command.actor.id, type: "user" },
    outcome: "success",
    summary,
    detail: { roleId: command.roleId, roleKey: role.key, permissionKeys: command.permissionKeys, affectedUserCount: affectedUserIds.length },
  });

  return { success: true, data: toRoleRef(updated) };
}
