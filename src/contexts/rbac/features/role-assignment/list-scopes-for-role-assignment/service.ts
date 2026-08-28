import { findScopesForRoleAssignment } from "./store";
import type { ListScopesForRoleAssignmentInput, ListScopesForRoleAssignmentResult } from "./types";

// Escopos (linhas de role_assignment_scopes) de UMA atribuição de papel (userId × roleId) — o
// recorte por atribuição que getUserContext não dá (lá o valor já vem unido entre papéis).
// Consumido pela tela de atribuição em /admin/rbac (Fase C de docs/rbac-scoped-roles.md).
export async function listScopesForRoleAssignment(
  command: ListScopesForRoleAssignmentInput,
): Promise<ListScopesForRoleAssignmentResult> {
  const scopes = await findScopesForRoleAssignment(command.userId, command.roleId);
  return { success: true, data: scopes };
}
