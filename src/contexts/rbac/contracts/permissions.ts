import type { PermissionDefinition } from "./types";

export const RBAC_PERMISSIONS: PermissionDefinition[] = [
  { key: "rbac.roles.manage", label: "Gerenciar papéis e permissions" },
  { key: "rbac.roles.assign", label: "Atribuir papéis a usuários" },
];
