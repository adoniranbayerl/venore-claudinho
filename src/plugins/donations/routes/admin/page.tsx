import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getDonationSettings } from "@/plugins/donations";
import { getDonationsPageData } from "@/platform/admin-shell/get-donations-page-data";
import { DonationSettingsForm } from "./donation-settings-form";

export default async function DonationsAdminPage() {
  const gate = await getDonationsPageData();

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para configurar as doações." />;
  }

  const settingsResult = await getDonationSettings();
  if (!settingsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar configuração: {settingsResult.error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Doações"
        description="Chave PIX estática usada para gerar o código de doação. Sem gateway de pagamento e sem confirmação automática — a conciliação é manual, pelo extrato bancário."
      />

      <DonationSettingsForm settings={settingsResult.data} />
    </div>
  );
}
