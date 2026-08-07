"use client";

import { useState } from "react";
import { HandCoins, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDonationPixCodeAction } from "../actions";
import { DEFAULT_WIDGET_COPY, DonationWidget, formatCurrency } from "./donation-widget";
import type { DonationPixCode, DonationWidgetCopy } from "../contracts/types";

type DonationTeaserProps = {
  title: string;
  ctaLabel: string;
  message?: string;
  suggestedAmounts: number[];
  // Linha abaixo do título — texto inteiro editável, não só um prefixo. Dois templates porque a
  // frase muda de estrutura conforme existe ou não um valor sugerido (não dá pra cobrir os dois
  // casos com um só template + interpolação); "{amount}" é o único token substituído (valor
  // formatado, ex: "R$ 5,00" — o resto do texto é livre). Ambos opcionais pra não quebrar quem já
  // usa este componente sem passar o prop (donations-pix-teaser-block.tsx, block de CMS genérico).
  subtitleWithAmount?: string;
  subtitleNoAmount?: string;
  // Cobre tanto o texto próprio deste componente ("Fechar"/"Carregando...") quanto o repasse pro
  // DonationWidget que aparece ao expandir — mesmo objeto, mesmo motivo de donation-widget.tsx.
  copy?: DonationWidgetCopy;
};

// Selo/chamada pra embutir em qualquer página sem competir por espaço com o conteúdo ao redor —
// bem menor que o block "donations.pix-widget" mesmo no modo compacto, porque não carrega QR
// nenhum até a pessoa pedir. Clicar em "Doar agora" busca o código PIX na hora (mesma Server
// Action que o widget completo usa pra regenerar por valor, ver ../actions.ts) e expande pro
// DonationWidget compacto embaixo — nunca navega pra /donations, mesma regra do widget completo.
export function DonationTeaser({
  title,
  ctaLabel,
  message,
  suggestedAmounts,
  subtitleWithAmount = "Contribua com a partir de {amount}",
  subtitleNoAmount = "Contribua com o valor que você quiser",
  copy = DEFAULT_WIDGET_COPY,
}: DonationTeaserProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<DonationPixCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExpand() {
    if (code) {
      setExpanded(true);
      return;
    }

    setLoading(true);
    setError(null);
    const initialAmount = suggestedAmounts[0] ?? null;
    const result = await generateDonationPixCodeAction(initialAmount);
    setLoading(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }
    setCode(result.data);
    setExpanded(true);
  }

  if (expanded && code) {
    return (
      <div className="space-y-2">
        <DonationWidget title={title} message={message} suggestedAmounts={suggestedAmounts} initialCode={code} compact copy={copy} />
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex w-full items-center justify-center gap-1 text-xs text-muted-foreground ui-motion-base hover:text-foreground"
        >
          <X className="size-3" />
          {copy.closeLabel}
        </button>
      </div>
    );
  }

  const subtitle = suggestedAmounts[0]
    ? subtitleWithAmount.replace("{amount}", formatCurrency(suggestedAmounts[0]))
    : subtitleNoAmount;

  return (
    <div className="relative overflow-hidden rounded-panel border border-primary/20 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-4">
      <div className="flex items-center gap-3">
        <HandCoins className="size-6 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="line-clamp-2 leading-tight font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {/* Luz girando na borda do botão — efeito próprio (sem precedente no repo), não o vocabulário
          ui-motion-* (que é só pra transição de estado/hover, não animação ambiente em loop).
          Camada de baixo (isolate + -z-10) gira um conic-gradient bem maior que a caixa; o
          overflow-hidden + rounded-lg do container corta pra só sobrar um fio de luz passando pela
          borda de 1px (Button some por baixo por causa do m-px). 6s (bem mais lento que o "spin"
          padrão de 1s do Tailwind) porque o pedido foi "não precisa ser rápido". */}
      <div className="relative isolate mt-3 flex overflow-hidden rounded-lg">
        <div
          aria-hidden="true"
          className="absolute inset-[-50%] -z-10 animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,var(--primary)_12%,transparent_28%)]"
        />
        <Button type="button" onClick={handleExpand} disabled={loading} className="relative m-px flex-1 gap-2">
          <Sparkles className="size-4" />
          {loading ? copy.loadingLabel : ctaLabel}
        </Button>
      </div>
    </div>
  );
}
