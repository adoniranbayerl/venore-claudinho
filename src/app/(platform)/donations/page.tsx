import { notFound } from "next/navigation";
import { buildDonationPixCode, getDonationSettings } from "@/plugins/donations";
import { DonationWidget } from "@/plugins/donations/components/donation-widget";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

// force-dynamic: mesmo motivo de birthdays/page.tsx — rota literal ("donations") precisa de
// prioridade sobre o catch-all [...slug], e a configuração muda em runtime.
export const dynamic = "force-dynamic";

// Sem gate de autenticação, sem authorizeActor em nenhum handler chamado aqui — doação é pública e
// anônima por pedido explícito do usuário (v1 sem login/cadastro do doador). Único gate é o de
// plugin ativo: desabilitado, a rota some por completo em vez de mostrar um widget quebrado.
export default async function DonationsPublicPage() {
  if (!(await isPluginActive("donations"))) {
    notFound();
  }

  const settingsResult = await getDonationSettings();
  if (!settingsResult.success) {
    return <p className="p-8 text-center text-sm text-destructive">Não foi possível carregar a página de doações.</p>;
  }

  // Primeiro carregamento já vem com o primeiro valor sugerido selecionado (pedido explícito do
  // usuário) — só cai pra "valor livre" (null) se o admin não configurou nenhum valor sugerido.
  const initialAmount = settingsResult.data.suggestedAmounts[0] ?? null;
  const codeResult = await buildDonationPixCode({ amount: initialAmount });

  if (!codeResult.success) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <p className="rounded-panel border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {codeResult.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <DonationWidget
        title={settingsResult.data.title}
        message={settingsResult.data.message}
        suggestedAmounts={settingsResult.data.suggestedAmounts}
        initialCode={codeResult.data}
      />
    </div>
  );
}
