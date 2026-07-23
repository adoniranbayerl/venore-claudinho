import { beginOperation, endOperation } from "@/observability";
import { findRoleByKey, insertRoleWithPermissions } from "./store";
import { toRoleRef } from "./view";
import type { CreateCustomRoleCommand, CreateCustomRoleResult } from "./types";

export async function createCustomRole(command: CreateCustomRoleCommand): Promise<CreateCustomRoleResult> {
  const handle = beginOperation({
    useCase: "rbac.role-management.create-custom-role",
    actor: { id: command.actor.id, type: "user" },
    kind: "write",
  });

  const existing = await findRoleByKey(command.key);
  if (existing) {
    const error = { code: "rbac.roles.key_taken", message: `Já existe um papel com a key "${command.key}".` };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const role = await insertRoleWithPermissions({
    key: command.key,
    name: command.name,
    permissionKeys: command.permissionKeys,
  });

  endOperation(handle, { success: true });

  return { success: true, data: toRoleRef(role) };
}
