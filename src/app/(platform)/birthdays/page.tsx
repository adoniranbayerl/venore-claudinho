import { notFound } from "next/navigation";
import { getBirthdayAppearance, listPublicBirthdays } from "@/plugins/birthdays";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { BirthdaysPublicBoard } from "./_components/birthdays-public-board";

// force-dynamic: mesmo motivo de app/page.tsx e do catch-all — cadastro e aparência mudam em
// runtime, e esta rota é literal ("birthdays") então tem prioridade sobre [...slug].
export const dynamic = "force-dynamic";

// Sem gate de autenticação, sem authorizeActor em nenhum handler chamado aqui — quadro de
// aniversários é público, por pedido explícito da Fase 2 (docs/plugins/birthdays-port.md). O
// único gate que existe é o de plugin ativo (Fase 6): desabilitado, a rota some por completo em
// vez de renderizar um quadro vazio.
export default async function BirthdaysPublicPage() {
  if (!(await isPluginActive("birthdays"))) {
    notFound();
  }

  const [birthdaysResult, appearanceResult] = await Promise.all([listPublicBirthdays(), getBirthdayAppearance()]);

  const birthdays = birthdaysResult.success ? birthdaysResult.data : [];
  const appearance = appearanceResult.success ? appearanceResult.data : undefined;

  if (!appearance) {
    return <p className="p-8 text-center text-sm text-destructive">Não foi possível carregar o quadro de aniversariantes.</p>;
  }

  return <BirthdaysPublicBoard birthdays={birthdays} appearance={appearance} />;
}
