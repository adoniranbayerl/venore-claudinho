import { getBirthdayAppearance, listPublicBirthdays } from "@/plugins/birthdays";
import { BirthdaysPublicBoard } from "./_components/birthdays-public-board";

// force-dynamic: mesmo motivo de app/page.tsx e do catch-all — cadastro e aparência mudam em
// runtime, e esta rota é literal ("birthdays") então tem prioridade sobre [...slug].
export const dynamic = "force-dynamic";

// Sem gate, sem authorizeActor em nenhum handler chamado aqui — quadro de aniversários é público,
// por pedido explícito da Fase 2 (docs/plugins/birthdays-port.md).
export default async function BirthdaysPublicPage() {
  const [birthdaysResult, appearanceResult] = await Promise.all([listPublicBirthdays(), getBirthdayAppearance()]);

  const birthdays = birthdaysResult.success ? birthdaysResult.data : [];
  const appearance = appearanceResult.success ? appearanceResult.data : undefined;

  if (!appearance) {
    return <p className="p-8 text-center text-sm text-destructive">Não foi possível carregar o quadro de aniversariantes.</p>;
  }

  return <BirthdaysPublicBoard birthdays={birthdays} appearance={appearance} />;
}
