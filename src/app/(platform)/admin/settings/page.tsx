import { getSetting } from "@/contexts/settings";
import { REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY } from "@/platform/registration/handle-user-registered";
import { getSettingsPageData } from "@/platform/admin-shell/get-settings-page-data";
import { RegistrationApprovalToggleForm } from "./_components/registration-approval-toggle-form";

export default async function SettingsAdminPage() {
  const gate = await getSettingsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-gray-900">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600">Você não tem permissão para gerenciar configurações do site.</p>
      </div>
    );
  }

  const settingResult = await getSetting({ key: REGISTRATION_APPROVAL_REQUIRED_SETTING_KEY });
  if (!settingResult.success) {
    return <p className="text-sm text-red-600">Erro ao carregar configurações: {settingResult.error.message}</p>;
  }

  // Mesmo fallback de handle-user-registered.ts: setting ausente ou com valor inesperado = aprovação exigida.
  const record = settingResult.data;
  const approvalRequired = !record || typeof record.value !== "string" ? true : record.value !== "false";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-600">Configurações gerais do site.</p>
      </div>

      <section className="rounded border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Registro de usuários</h2>
        <p className="mt-1 text-sm text-gray-600">
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
