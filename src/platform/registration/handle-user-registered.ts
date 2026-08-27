import { provisionUser } from "@/contexts/auth";
import { grantDefaultRoleOnRegistration, grantSuperadmin, superadminExists } from "@/contexts/rbac";
import { getSetting, registerDefaultSetting } from "@/contexts/settings";
import { registerPlugins } from "@/platform/plugin-engine/register-plugins";
import type { OperationResult } from "@/shared/types";

export type UserRegisteredInput = {
  id: string;
  email: string | null;
  name: string | null;
};

export const REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY = "auth.registration_approval_required";

// Default registrado no bootstrap (via ensureRegistrationSettingsRegistered abaixo), pra chave
// aparecer e ser editável em /admin/settings mesmo antes de qualquer troca. A leitura continua
// tolerante: setting ausente ou erro na leitura cai no comportamento seguro (aprovação exigida),
// mesmo padrão de FALLBACK_ACTIVE_THEME em
// contexts/themes/features/active-theme/get-active-theme/service.ts.
//
// Valor é um boolean real (não string "true"/"false"): a coluna jsonb já é parseada uma vez pelo
// driver node-postgres e de novo pelo mapFromDriverValue do drizzle, então uma string "false"
// volta como o boolean `false` na segunda leitura — comparar contra string nunca bateria (bug:
// a opção nunca desligava, sempre caía no fallback "aprovação exigida").
async function isApprovalRequired(): Promise<boolean> {
  const result = await getSetting({ key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY });
  if (!result.success || !result.data || typeof result.data.value !== "boolean") {
    return true;
  }
  return result.data.value;
}

// Registra o default das settings de registro. INSERT ... ON CONFLICT DO NOTHING no store
// (registerDefaultSetting), então nunca sobrescreve um valor já ajustado por um admin — seguro
// chamar em todo registro.
async function ensureRegistrationSettingsRegistered(): Promise<void> {
  await registerDefaultSetting({ key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY, value: true });
}

// Ponto de composição fora de auth e rbac (docs/venore-docks.md — regra 12): a hierarquia
// declarada é auth (sem dependências) -> rbac (depende de auth) -> contexts de domínio, então
// nem auth nem rbac podem importar um do outro para fechar este fluxo. auth.config.ts (evento
// createUser do Auth.js) chama esta função em vez de conhecer rbac diretamente.
export async function handleUserRegistered(user: UserRegisteredInput): Promise<OperationResult<void>> {
  // Garante settings default de plugin ativo (contexts/settings) antes do primeiro acesso — hoje
  // registerPlugins() só roda lazy em algumas páginas admin, nunca no bootstrap de fato.
  // Idempotente e cacheado 30s (register-plugins.ts) — seguro chamar em todo registro.
  await registerPlugins();
  await ensureRegistrationSettingsRegistered();

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
