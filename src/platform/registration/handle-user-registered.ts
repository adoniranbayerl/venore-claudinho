import { provisionUser } from "@/contexts/auth";
import { grantDefaultRoleOnRegistration, grantSuperadmin, superadminExists } from "@/contexts/rbac";
import { getSetting } from "@/contexts/settings";
import type { OperationResult } from "@/shared/types";

export type UserRegisteredInput = {
  id: string;
  email: string | null;
  name: string | null;
};

export const REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY = "auth.registration_approval_required";

// Configurável em runtime via /admin/settings (contexts/settings, chave acima). Nenhum default é
// registrado no bootstrap — mesmo padrão de FALLBACK_ACTIVE_THEME em
// contexts/themes/features/active-theme/get-active-theme/service.ts: setting ausente ou erro na
// leitura cai no mesmo comportamento de hoje (aprovação exigida).
async function isApprovalRequired(): Promise<boolean> {
  const result = await getSetting({ key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY });
  if (!result.success || !result.data || typeof result.data.value !== "string") {
    return true;
  }
  return result.data.value !== "false";
}

// Ponto de composição fora de auth e rbac (docs/venore-docks.md — regra 12): a hierarquia
// declarada é auth (sem dependências) -> rbac (depende de auth) -> contexts de domínio, então
// nem auth nem rbac podem importar um do outro para fechar este fluxo. auth.config.ts (evento
// createUser do Auth.js) chama esta função em vez de conhecer rbac diretamente.
export async function handleUserRegistered(user: UserRegisteredInput): Promise<OperationResult<void>> {
  // Bootstrap de superadmin (docs/venore-docks.md — Autenticação / Bootstrap de superadmin):
  // se ninguém no sistema tem o papel superadmin ainda, o próximo usuário a se registrar pula
  // pending e o papel padrão — independente da setting de aprovação estar ligada.
  const hasSuperadmin = await superadminExists();
  if (!hasSuperadmin.success) {
    return hasSuperadmin;
  }
  if (!hasSuperadmin.data) {
    return grantSuperadmin({ userId: user.id });
  }

  if (await isApprovalRequired()) {
    return provisionUser(user);
  }

  // Sem aprovação manual: contexts/auth/database/schema/index.ts já cria o usuário com
  // status "approved" por default (DrizzleAdapter escreve direto — exceção conhecida da
  // regra de store.ts, ver docs/venore-docks.md). Só falta conceder o papel padrão.
  return grantDefaultRoleOnRegistration({ userId: user.id });
}
