// Sem authorizeActor de propósito: é o mecanismo de bootstrap de superadmin (docs/venore-docks.md —
// Autenticação / Bootstrap de superadmin), chamado pela composição do fluxo de registro
// (platform/registration/handle-user-registered.ts) quando nenhum superadmin existe ainda, e pelo
// script one-shot (scripts/bootstrap-superadmin.mjs) — não uma ação livre de um ator sobre outro
// usuário, mesmo raciocínio de assign-default-role/handler.ts.
import { checkSuperadminExists } from "../check-superadmin-exists/service";
import { grantSuperadmin } from "./service";
import type { GrantSuperadminInput, GrantSuperadminResult } from "./types";

export async function grantSuperadminHandler(input: GrantSuperadminInput): Promise<GrantSuperadminResult> {
  if (input.userId.trim().length === 0) {
    return { success: false, error: { code: "rbac.roles.invalid_id", message: "userId não pode ser vazio." } };
  }

  // P1 — escalada de privilégio: sem re-checar aqui, qualquer chamador (a Server Action de setup
  // era o furo original) concede superadmin mesmo já existindo um. O gate na página /setup não
  // bastava. Só o script de bootstrap pula isto (ver types.ts).
  if (!input.bypassExistsCheck) {
    const exists = await checkSuperadminExists();
    if (!exists.success) {
      return exists;
    }
    if (exists.data) {
      return {
        success: false,
        error: {
          code: "rbac.roles.superadmin_already_exists",
          message: "Já existe um superadmin — use /admin/rbac para conceder o papel a mais alguém.",
        },
      };
    }
  }

  return grantSuperadmin({ userId: input.userId });
}
