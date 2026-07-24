"use server";

import { revalidatePath } from "next/cache";
import { assignRoleToUser, createCustomRole, removeRoleFromUser, updateRolePermissions } from "@/contexts/rbac";

function getAllValues(formData: FormData, key: string): string[] {
  return formData.getAll(key).map((value) => String(value));
}

export async function createRoleAction(formData: FormData) {
  await createCustomRole({
    key: String(formData.get("key") ?? ""),
    name: String(formData.get("name") ?? ""),
    permissionKeys: getAllValues(formData, "permissionKeys"),
  });

  revalidatePath("/admin/rbac");
}

export async function updateRolePermissionsAction(formData: FormData) {
  await updateRolePermissions({
    roleId: String(formData.get("roleId") ?? ""),
    permissionKeys: getAllValues(formData, "permissionKeys"),
  });

  revalidatePath("/admin/rbac");
}

export async function assignRoleAction(formData: FormData) {
  await assignRoleToUser({
    roleId: String(formData.get("roleId") ?? ""),
    userId: String(formData.get("userId") ?? ""),
  });

  revalidatePath("/admin/rbac");
}

export type RemoveRoleActionState = { error: string | null };

// Client Component (RemoveRoleButton) usa useActionState para exibir o erro retornado pelo
// handler (ex: rbac.roles.cannot_remove_last_superadmin) em vez de falhar silenciosamente.
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
