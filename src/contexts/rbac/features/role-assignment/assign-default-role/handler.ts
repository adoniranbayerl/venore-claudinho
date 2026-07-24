// Sem authorizeActor de propósito: não é uma ação administrativa de um ator sobre outro
// usuário — é a concessão automática do próprio fluxo de registro (aprovação desligada),
// disparada por contexts/auth/features/identity/provision-user quando o usuário novo (que
// ainda não tem nenhuma permission) faz o primeiro login. Não expor isso como ação livre.
import { grantDefaultRoleOnRegistration } from "./service";
import type { GrantDefaultRoleInput, GrantDefaultRoleResult } from "./types";

export async function grantDefaultRoleOnRegistrationHandler(input: GrantDefaultRoleInput): Promise<GrantDefaultRoleResult> {
  if (input.userId.trim().length === 0) {
    return { success: false, error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." } };
  }
  return grantDefaultRoleOnRegistration(input);
}
