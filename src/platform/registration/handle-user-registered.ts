import { provisionUser } from "@/contexts/auth";
import { grantDefaultRoleOnRegistration, grantSuperadmin, superadminExists } from "@/contexts/rbac";
import type { OperationResult } from "@/shared/types";

export type UserRegisteredInput = {
  id: string;
  email: string | null;
  name: string | null;
};

// TODO: migrar para settings de plugin quando o manifesto existir (docs/venore-docks.md — Sistema de plugins).
function isApprovalRequired(): boolean {
  const raw = process.env.AUTH_REGISTRATION_APPROVAL_REQUIRED;
  return raw === undefined ? true : raw !== "false";
}

// Ponto de composição fora de auth e rbac (docs/venore-docks.md — regra 12): a hierarquia
// declarada é auth (sem dependências) -> rbac (depende de auth) -> contexts de domínio, então
// nem auth nem rbac podem importar um do outro para fechar este fluxo. auth.config.ts (evento
// createUser do Auth.js) chama esta função em vez de conhecer rbac diretamente.
export async function handleUserRegistered(user: UserRegisteredInput): Promise<OperationResult<void>> {
  // Bootstrap de superadmin (docs/venore-docks.md — Autenticação / Bootstrap de superadmin):
  // se ninguém no sistema tem o papel superadmin ainda, o próximo usuário a se registrar pula
  // pending e o papel padrão — independente de AUTH_REGISTRATION_APPROVAL_REQUIRED estar ligado.
  const hasSuperadmin = await superadminExists();
  if (!hasSuperadmin.success) {
    return hasSuperadmin;
  }
  if (!hasSuperadmin.data) {
    return grantSuperadmin({ userId: user.id });
  }

  if (isApprovalRequired()) {
    return provisionUser(user);
  }

  // Sem aprovação manual: contexts/auth/database/schema/index.ts já cria o usuário com
  // status "approved" por default (DrizzleAdapter escreve direto — exceção conhecida da
  // regra de store.ts, ver docs/venore-docks.md). Só falta conceder o papel padrão.
  return grantDefaultRoleOnRegistration({ userId: user.id });
}
