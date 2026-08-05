import { getDonationSettingsHandler } from "../features/get-donation-settings/handler";
import { DonationTeaser } from "../components/donation-teaser";
import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";

function readString(data: Record<string, unknown>, key: string, fallback: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

// Só busca as settings (texto/valores sugeridos) — o código PIX em si só é gerado quando a pessoa
// clica em "Doar agora" (DonationTeaser, client), pra este block ficar leve em qualquer página que
// o use, mesmo em quantidade.
export async function DonationsPixTeaserBlock({ block, mode }: BlockRendererProps) {
  const settingsResult = await getDonationSettingsHandler();

  // Mesmo critério de "não configurado" que build-donation-pix-code/service.ts usa (pixKey +
  // nome + cidade) — checado aqui direto porque este block não chama esse service até o clique.
  const isConfigured =
    settingsResult.success &&
    Boolean(settingsResult.data.pixKey && settingsResult.data.recipientName && settingsResult.data.recipientCity);

  if (!isConfigured) {
    if (mode === "edit") {
      return (
        <div className="rounded-panel border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
          Chamada de doação: configure a chave PIX em <span className="font-medium text-foreground">/admin/donations</span> pra este
          bloco aparecer publicado.
        </div>
      );
    }
    return null;
  }

  const title = readString(block.data, "title", "Apoie esse projeto");
  const ctaLabel = readString(block.data, "ctaLabel", "Doar agora");

  return (
    <DonationTeaser
      title={title}
      ctaLabel={ctaLabel}
      message={settingsResult.success ? settingsResult.data.message : undefined}
      suggestedAmounts={settingsResult.success ? settingsResult.data.suggestedAmounts : []}
    />
  );
}
