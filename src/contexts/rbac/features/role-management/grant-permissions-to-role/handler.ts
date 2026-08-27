// Sem authorizeActor de propósito: não é uma ação administrativa avulsa de um ator sobre um papel
// — é um passo da instalação de plugin (já autorizada por platform.extensions.manage em
// contexts/extensions/set-extension-installed), disparado por
// platform/plugin-engine/install-plugin.ts para conceder ao papel "admin" as permissions
// declaradas no manifesto do plugin. Não expor como ação livre — mesmo racional de
// assign-default-role/handler.ts.
import { grantPermissionsToRole } from "./service";
import type { GrantPermissionsToRoleInput, GrantPermissionsToRoleResult } from "./types";

export async function grantPermissionsToRoleHandler(
  input: GrantPermissionsToRoleInput,
): Promise<GrantPermissionsToRoleResult> {
  if (input.roleKey.trim().length === 0) {
    return { success: false, error: { code: "rbac.roles.invalid_id", message: "roleKey não pode ser vazio." } };
  }
  if (!Array.isArray(input.permissionKeys)) {
    return {
      success: false,
      error: { code: "rbac.roles.invalid_permissions", message: "permissionKeys deve ser um array." },
    };
  }
  return grantPermissionsToRole(input);
}
