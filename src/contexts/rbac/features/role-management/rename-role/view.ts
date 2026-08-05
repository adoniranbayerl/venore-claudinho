import type { RoleRef } from "../../../contracts/types";

export function toRoleRef(role: { id: string; key: string; name: string; isSystem: boolean }): RoleRef {
  return {
    id: role.id,
    key: role.key,
    name: role.name,
    isSystem: role.isSystem,
  };
}
