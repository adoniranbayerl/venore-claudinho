import { getBirthdayAppearance } from "@/plugins/birthdays";
import { getBirthdaysPageData } from "@/platform/admin-shell/get-birthdays-page-data";
import { BirthdaysAppearanceForm } from "./_components/birthdays-appearance-form";

export default async function BirthdaysAppearancePage() {
  const gate = await getBirthdaysPageData();

  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver os aniversariantes.</p>
      </div>
    );
  }

  const appearanceResult = await getBirthdayAppearance();
  if (!appearanceResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar aparência: {appearanceResult.error.message}</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Aparência dos aniversariantes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cores usadas no quadro público de aniversariantes.</p>
      </div>

      <BirthdaysAppearanceForm appearance={appearanceResult.data} />
    </div>
  );
}
