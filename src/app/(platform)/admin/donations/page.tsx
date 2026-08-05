import { getDonationSettings } from "@/plugins/donations";
import { getDonationsPageData } from "@/platform/admin-shell/get-donations-page-data";
import { DonationSettingsForm } from "./_components/donation-settings-form";

export default async function DonationsAdminPage() {
  const gate = await getDonationsPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para configurar as doações.</p>
      </div>
    );
  }

  const settingsResult = await getDonationSettings();
  if (!settingsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar configuração: {settingsResult.error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Doações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chave PIX estática usada para gerar o código de doação. Sem gateway de pagamento e sem confirmação automática — a conciliação é
          manual, pelo extrato bancário.
        </p>
      </div>

      <DonationSettingsForm settings={settingsResult.data} />
    </div>
  );
}
