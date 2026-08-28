export type RoleRef = {
  id: string;
  key: string;
  name: string;
  isSystem: boolean;
};

export type PermissionDefinition = {
  key: string;
  label: string;
};

// Fase B de docs/rbac-scoped-roles.md (D4). Por permissionKey concedida por ao menos um papel:
// para cada scopeType que recorta essa key (RBAC_SCOPE_TYPES), "global" se algum papel a concede
// sem linha de escopo daquele tipo; senão a UNIÃO dos resourceId dos papéis que a têm escopada.
// Só entram keys que ao menos um papel concede E que algum scopeType declara como recortável.
export type ScopedPermissionMap = Record<string, Record<string, "global" | string[]>>;

export type UserRbacContext = {
  userId: string;
  roles: RoleRef[];
  // União de TODAS as permission keys (global ou escopada) — inalterado, mantém os ~15 call
  // sites de `.includes(...)` funcionando (um editor escopado aparece aqui com a key e continua
  // entrando na seção; o recorte fino é via `scopedPermissions` / `authorizeActor(perm, scope)`).
  permissions: string[];
  isSuperadmin: boolean;
  scopedPermissions: ScopedPermissionMap;
};
