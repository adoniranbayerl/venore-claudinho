import { RBAC_SCOPE_TYPES } from "../../../contracts/scope-types";
import type { ScopedPermissionMap, UserRbacContext, RoleRef } from "../../../contracts/types";
import type { UserRoleRow, UserScopeRow } from "./store";

// Quais scopeTypes recortam cada permission key — derivado uma vez de RBAC_SCOPE_TYPES (D5).
const SCOPE_TYPES_BY_PERMISSION = new Map<string, string[]>();
for (const scope of RBAC_SCOPE_TYPES) {
  for (const key of scope.scopablePermissionKeys) {
    const list = SCOPE_TYPES_BY_PERMISSION.get(key) ?? [];
    list.push(scope.type);
    SCOPE_TYPES_BY_PERMISSION.set(key, list);
  }
}

export function toUserRbacContext(
  userId: string,
  roleRows: UserRoleRow[],
  scopeRows: UserScopeRow[] = [],
): UserRbacContext {
  const rolesById = new Map<string, RoleRef>();
  const permissions = new Set<string>();
  // roleId → permission keys que ESTE papel concede (para cruzar com o escopo por atribuição).
  const permissionsByRole = new Map<string, Set<string>>();

  for (const row of roleRows) {
    rolesById.set(row.roleId, {
      id: row.roleId,
      key: row.roleKey,
      name: row.roleName,
      isSystem: row.roleIsSystem,
    });

    if (row.permissionKey) {
      permissions.add(row.permissionKey);
      let set = permissionsByRole.get(row.roleId);
      if (!set) {
        set = new Set<string>();
        permissionsByRole.set(row.roleId, set);
      }
      set.add(row.permissionKey);
    }
  }

  // roleId → scopeType → Set<resourceId> (linhas de role_assignment_scopes desta atribuição).
  const scopesByRole = new Map<string, Map<string, Set<string>>>();
  for (const row of scopeRows) {
    let byType = scopesByRole.get(row.roleId);
    if (!byType) {
      byType = new Map<string, Set<string>>();
      scopesByRole.set(row.roleId, byType);
    }
    let ids = byType.get(row.scopeType);
    if (!ids) {
      ids = new Set<string>();
      byType.set(row.scopeType, ids);
    }
    ids.add(row.resourceId);
  }

  // permKey → scopeType → "global" | Set<resourceId>. Regra D2: por papel que concede permKey,
  // se a atribuição tem linha(s) de escopo do tipo T → contribui com esses ids; senão → "global".
  // União: "global" de qualquer papel satura (escopo nunca subtrai alcance amplo).
  const accumulator = new Map<string, Map<string, "global" | Set<string>>>();
  for (const [roleId, permKeys] of permissionsByRole) {
    const roleScopes = scopesByRole.get(roleId);
    for (const permKey of permKeys) {
      const scopeTypes = SCOPE_TYPES_BY_PERMISSION.get(permKey);
      if (!scopeTypes) continue;

      let byType = accumulator.get(permKey);
      if (!byType) {
        byType = new Map<string, "global" | Set<string>>();
        accumulator.set(permKey, byType);
      }

      for (const scopeType of scopeTypes) {
        if (byType.get(scopeType) === "global") continue;

        const roleIds = roleScopes?.get(scopeType);
        if (roleIds && roleIds.size > 0) {
          const existing = byType.get(scopeType);
          if (existing instanceof Set) {
            for (const id of roleIds) existing.add(id);
          } else {
            byType.set(scopeType, new Set(roleIds));
          }
        } else {
          byType.set(scopeType, "global");
        }
      }
    }
  }

  const scopedPermissions: ScopedPermissionMap = {};
  for (const [permKey, byType] of accumulator) {
    const entry: Record<string, "global" | string[]> = {};
    for (const [scopeType, value] of byType) {
      entry[scopeType] = value === "global" ? "global" : [...value].sort();
    }
    scopedPermissions[permKey] = entry;
  }

  const roles = [...rolesById.values()];

  return {
    userId,
    roles,
    permissions: [...permissions],
    isSuperadmin: roles.some((role) => role.key === "superadmin"),
    scopedPermissions,
  };
}
