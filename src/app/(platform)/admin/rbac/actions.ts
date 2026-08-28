"use server";

import { revalidatePath } from "next/cache";
import {
  assignRoleToUser,
  assignScopeToRoleAssignment,
  createCustomRole,
  removeRoleFromUser,
  removeScopeFromRoleAssignment,
  renameRole,
  updateRolePermissions,
} from "@/contexts/rbac";

// Fase C de docs/rbac-scoped-roles.md — escopo por categoria do CMS. Único scopeType hoje.
const CMS_CATEGORY_SCOPE_TYPE = "cms.category";

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
  const roleId = String(formData.get("roleId") ?? "");
  const userId = String(formData.get("userId") ?? "");

  const result = await assignRoleToUser({ roleId, userId });
  if (!result.success) {
    return { error: result.error.message };
  }

  // Fase C: se o form trouxe categorias, limita a atribuição a elas. Sem categorias = papel
  // global pra esse usuário (comportamento anterior, mantido). Papéis sem permission escopável
  // simplesmente não renderizam o picker, então `categoryIds` vem vazio.
  const categoryIds = formData.getAll("categoryIds").map((value) => String(value));
  for (const resourceId of categoryIds) {
    const scoped = await assignScopeToRoleAssignment({
      userId,
      roleId,
      scopeType: CMS_CATEGORY_SCOPE_TYPE,
      resourceId,
    });
    if (!scoped.success) {
      return { error: scoped.error.message };
    }
  }

  revalidatePath("/admin/rbac");
  return { error: null };
}

// Ajusta as categorias de uma atribuição JÁ existente (userId × roleId): faz o diff entre as
// marcadas agora (`categoryIds`) e as atuais (`currentCategoryIds`, hidden) e chama
// assign/removeScopeFromRoleAssignment só nas diferenças. Nenhuma marcada = volta a global.
export async function setRoleAssignmentScopesAction(
  _prevState: RbacActionState,
  formData: FormData,
): Promise<RbacActionState> {
  const roleId = String(formData.get("roleId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const desired = new Set(formData.getAll("categoryIds").map((value) => String(value)));
  const current = new Set(formData.getAll("currentCategoryIds").map((value) => String(value)));

  for (const resourceId of desired) {
    if (current.has(resourceId)) continue;
    const result = await assignScopeToRoleAssignment({ userId, roleId, scopeType: CMS_CATEGORY_SCOPE_TYPE, resourceId });
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  for (const resourceId of current) {
    if (desired.has(resourceId)) continue;
    const result = await removeScopeFromRoleAssignment({ userId, roleId, scopeType: CMS_CATEGORY_SCOPE_TYPE, resourceId });
    if (!result.success) {
      return { error: result.error.message };
    }
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
