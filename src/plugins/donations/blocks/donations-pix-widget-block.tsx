import { getDonationSettingsHandler } from "../features/get-donation-settings/handler";
import { buildDonationPixCodeHandler } from "../features/build-donation-pix-code/handler";
import { DonationWidget } from "../components/donation-widget";
import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";
import { hasRichTextContent, renderRichTextContent, RICH_TEXT_INLINE_CLASSES } from "@/platform/page-builder/rich-text/render";

function readString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function DonationsPixWidgetBlock({ block, mode }: BlockRendererProps) {
  const settingsResult = await getDonationSettingsHandler();
  // Primeiro carregamento já vem com o primeiro valor sugerido selecionado (mesmo padrão da
  // página pública, /donations) — só cai pra "valor livre" (null) sem valores sugeridos.
  const initialAmount = settingsResult.success ? (settingsResult.data.suggestedAmounts[0] ?? null) : null;
  const codeResult = await buildDonationPixCodeHandler({ amount: initialAmount });

  // Handlers são públicos (sem auth) — uma falha aqui é chave PIX ainda não configurada ou erro de
  // infraestrutura, não de permissão. Em "published" o bloco some (mesmo padrão de
  // BirthdaysMonthListBlock); em "edit" mostra um aviso pro editor entender o que falta, já que
  // "não configurado" é bem diferente de "bloco quebrado".
  if (!settingsResult.success || !codeResult.success) {
    if (mode === "edit") {
      return (
        <div className="rounded-panel border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
          Widget de doação: configure a chave PIX em <span className="font-medium text-foreground">/admin/donations</span> pra este
          bloco aparecer publicado.
        </div>
      );
    }
    return null;
  }

  const title = readString(block.data, "title") ?? settingsResult.data.title;
  const description = block.data.description;
  const message = hasRichTextContent(description) ? (
    <div className={RICH_TEXT_INLINE_CLASSES}>{renderRichTextContent(description)}</div>
  ) : (
    settingsResult.data.message
  );
  const compact = block.data.variant === "compact";

  return (
    <DonationWidget
      title={title}
      message={message}
      suggestedAmounts={settingsResult.data.suggestedAmounts}
      initialCode={codeResult.data}
      compact={compact}
    />
  );
}
