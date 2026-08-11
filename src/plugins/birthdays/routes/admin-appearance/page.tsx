import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { getBirthdayAppearance } from "@/plugins/birthdays";
import { getBirthdaysPageData } from "@/platform/admin-shell/get-birthdays-page-data";
import { BirthdaysAppearanceForm } from "./birthdays-appearance-form";

export default async function BirthdaysAppearancePage() {
  const gate = await getBirthdaysPageData();

  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver os aniversariantes." />;
  }

  const appearanceResult = await getBirthdayAppearance();
  if (!appearanceResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aparência: {appearanceResult.error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Aparência dos aniversariantes" description="Cores usadas no quadro público de aniversariantes." />

      <BirthdaysAppearanceForm appearance={appearanceResult.data} />
    </div>
  );
}
