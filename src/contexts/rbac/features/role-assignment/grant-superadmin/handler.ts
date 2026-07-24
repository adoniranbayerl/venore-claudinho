// Sem authorizeActor de propósito: é o mecanismo de bootstrap de superadmin (docs/venore-docks.md —
// Autenticação / Bootstrap de superadmin), chamado pela composição do fluxo de registro
// (platform/registration/handle-user-registered.ts) quando nenhum superadmin existe ainda, e pelo
// script one-shot (scripts/bootstrap-superadmin.mjs) — não uma ação livre de um ator sobre outro
// usuário, mesmo raciocínio de assign-default-role/handler.ts.
import { grantSuperadmin } from "./service";
import type { GrantSuperadminInput, GrantSuperadminResult } from "./types";

export async function grantSuperadminHandler(input: GrantSuperadminInput): Promise<GrantSuperadminResult> {
  if (input.userId.trim().length === 0) {
    return { success: false, error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." } };
  }

  return grantSuperadmin(input);
}
