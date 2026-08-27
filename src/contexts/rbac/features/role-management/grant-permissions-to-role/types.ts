import type { OperationResult } from "@/shared/types";

export type GrantPermissionsToRoleInput = {
  roleKey: string;
  permissionKeys: string[];
};

// grantedCount = quantas linhas novas de fato entraram em role_permissions (as que já existiam
// são ignoradas por onConflictDoNothing). Zero é sucesso — só significa "nada de novo a conceder".
export type GrantPermissionsToRoleResult = OperationResult<{ grantedCount: number }>;
