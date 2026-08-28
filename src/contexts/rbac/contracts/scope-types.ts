// Catálogo dos tipos de escopo de recurso que o RBAC reconhece — rótulo/UI, do mesmo jeito que
// RBAC_PERMISSIONS (contracts/permissions.ts). O RBAC NÃO resolve as instâncias (quais categorias
// existem, seus nomes): isso é composição em platform/ (ver D5 de docs/rbac-scoped-roles.md).
//
// `scopablePermissionKeys`: as permission keys cujo alcance pode ser recortado por esse tipo de
// escopo. É a fonte única (D5) que o view.ts de get-user-context usa para decidir quais pares
// (permissionKey, scopeType) entram em `scopedPermissions`. Uma linha em `role_assignment_scopes`
// de scopeType T só faz sentido para uma atribuição de papel que conceda ao menos uma dessas keys.
//
// Fase B: só existe `cms.category`, e nada ainda passa `scope` — a infra está dormente. O recorte
// de fato dos handlers do CMS é a Fase C.
export const RBAC_SCOPE_TYPES = [
  {
    type: "cms.category",
    label: "Categoria do CMS",
    scopablePermissionKeys: ["cms.categories.manage", "cms.entries.manage", "cms.entries.publish"],
  },
] as const;

export type RbacScopeType = (typeof RBAC_SCOPE_TYPES)[number]["type"];

export function isRbacScopeType(value: string): value is RbacScopeType {
  return RBAC_SCOPE_TYPES.some((scope) => scope.type === value);
}
