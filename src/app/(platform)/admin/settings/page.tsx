import { getSetting } from "@/contexts/settings";
import { REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY } from "@/platform/registration/handle-user-registered";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { RegistrationApprovalToggleForm } from "./_components/registration-approval-toggle-form";

export default async function SettingsAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-border-subtle bg-surface-panel p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Acesso negado</h1>
        <p className="mt-2 text-sm text-text-secondary">Você não tem permissão para gerenciar configurações do site.</p>
      </div>
    );
  }

  const settingResult = await getSetting({ key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY });
  if (!settingResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar configurações: {settingResult.error.message}</p>;
  }

  // Mesmo fallback de handle-user-registered.ts: setting ausente ou com valor inesperado = aprovação exigida.
  const record = settingResult.data;
  const approvalRequired = !record || typeof record.value !== "string" ? true : record.value !== "false";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Configurações</h1>
        <p className="mt-1 text-sm text-text-secondary">Configurações gerais do site.</p>
      </div>

      <section className="rounded border border-border-subtle bg-surface-panel p-4">
        <h2 className="text-sm font-semibold text-text-primary">Registro de usuários</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Quando ativado, novos registros ficam pendentes até um admin aprovar (exceto o primeiro usuário do sistema,
          que sempre vira superadmin).
        </p>
        <div className="mt-3">
          <RegistrationApprovalToggleForm enabled={approvalRequired} />
        </div>
      </section>
    </div>
  );
}
