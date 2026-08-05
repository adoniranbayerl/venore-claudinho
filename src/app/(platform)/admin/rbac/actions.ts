"use server";

import { revalidatePath } from "next/cache";
import { assignRoleToUser, createCustomRole, removeRoleFromUser, renameRole, updateRolePermissions } from "@/contexts/rbac";

function getAllValues(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((value) => String(value));
}

export type RbacActionState = { error: string | null };

// Mesmo padrão de removeRoleAction: erro do handler é devolvido de verdade via useActionState,
// nunca descartado silenciosamente (docs/venore-docks.md).
export async function createRoleAction(_prevState: RbacActionState, formData: FormData): Promise<RbacActionState> {
  const result = await createCustomRole({
    key: String(formData.get("key") ?? ""),
    name: String(formData.get("name") ?? ""),
    permissionKeys: getAllValues(formData, "permissionKeys"),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}

export async function updateRolePermissionsAction(
  _prevState: RbacActionState,
  formData: FormData,
): Promise<RbacActionState> {
  const result = await updateRolePermissions({
    roleId: String(formData.get("roleId") ?? ""),
    permissionKeys: getAllValues(formData, "permissionKeys"),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}

export async function renameRoleAction(_prevState: RbacActionState, formData: FormData): Promise<RbacActionState> {
  const result = await renameRole({
    roleId: String(formData.get("roleId") ?? ""),
    name: String(formData.get("name") ?? ""),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}

export async function assignRoleAction(_prevState: RbacActionState, formData: FormData): Promise<RbacActionState> {
  const result = await assignRoleToUser({
    roleId: String(formData.get("roleId") ?? ""),
    userId: String(formData.get("userId") ?? ""),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}

export type RemoveRoleActionState = RbacActionState;

export async function removeRoleAction(
  _prevState: RemoveRoleActionState,
  formData: FormData,
): Promise<RemoveRoleActionState> {
  const result = await removeRoleFromUser({
    roleId: String(formData.get("roleId") ?? ""),
    userId: String(formData.get("userId") ?? ""),
  });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}
