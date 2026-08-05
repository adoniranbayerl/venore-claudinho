"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateDonationPixCodeAction } from "../actions";
import type { DonationPixCode } from "../contracts/types";

type DonationWidgetProps = {
  title: string;
  message?: ReactNode;
  suggestedAmounts: number[];
  initialCode: DonationPixCode;
  // Versão reduzida do mesmo widget (mesma interação, sem link pra /donations) — pro block
  // "donations.pix-widget" quando embutido num espaço apertado (sidebar, banner). Só ajusta
  // tamanho/densidade visual, nunca esconde funcionalidade.
  compact?: boolean;
};

// Quanto tempo o QR fica com o destaque "acabou de mudar" depois de uma regeneração — só feedback
// visual, sem relação com nenhum estado de negócio.
const QR_UPDATED_HIGHLIGHT_MS = 1500;

// Exportado pra donation-teaser.tsx reaproveitar a mesma formatação no "a partir de R$X".
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Componente único reusado pela página pública (/donations) e pelo block "donations.pix-widget"
// embutido em páginas CMS — a interação (escolher valor -> regenerar QR) é a mesma nos dois
// lugares, só a moldura ao redor muda. Chama a Server Action do próprio plugin (../actions.ts)
// porque é o único ponto de entrada compartilhado entre a página e o block (ver comentário lá).
export function DonationWidget({ title, message, suggestedAmounts, initialCode, compact = false }: DonationWidgetProps) {
  const [code, setCode] = useState(initialCode);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(initialCode.amount);
  // Campo de valor próprio some por padrão — só abre quando a pessoa pede (revisão de UX: usuário
  // com pouca familiaridade com celular se perde vendo campo+botão junto dos valores sugeridos o
  // tempo todo). "Escolha o valor" continua marcado como selecionado enquanto o campo está aberto
  // ou o valor atual não é nenhum dos sugeridos.
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Destaque temporário no QR depois de regenerar — pedido explícito: precisa ficar claro que o
  // código mudou e que é preciso escanear de novo (não só trocar a imagem em silêncio).
  const [justUpdated, setJustUpdated] = useState(false);
  const [isPending, startTransition] = useTransition();
  const customAmountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCustomAmountInput) {
      customAmountInputRef.current?.focus();
    }
  }, [showCustomAmountInput]);

  function regenerate(amount: number | null) {
    setError(null);
    setCopied(false);
    startTransition(async () => {
      const result = await generateDonationPixCodeAction(amount);
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      setCode(result.data);
      setSelectedAmount(amount);
      setJustUpdated(true);
      window.setTimeout(() => setJustUpdated(false), QR_UPDATED_HIGHLIGHT_MS);
    });
  }

  function handleSuggestedAmount(amount: number) {
    setShowCustomAmountInput(false);
    setCustomAmount("");
    regenerate(amount);
  }

  function handleChooseCustomAmount() {
    setShowCustomAmountInput(true);
  }

  function handleCustomAmountSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(customAmount.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Digite um valor válido, maior que zero.");
      return;
    }
    regenerate(parsed);
    setShowCustomAmountInput(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(code.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isCustomAmountActive = showCustomAmountInput || (selectedAmount != null && !suggestedAmounts.includes(selectedAmount));
  const amountButtonSize = compact ? "default" : "lg";
  const qrMaxWidthClass = compact ? "max-w-40" : "max-w-60";

  return (
    <div className={cn("rounded-panel border border-border bg-card", compact ? "p-3 sm:p-4" : "p-4 sm:p-6")}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
            compact ? "size-8" : "size-10",
          )}
        >
          <HandCoins className={compact ? "size-4" : "size-5"} />
        </span>
        <h2 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>{title}</h2>
      </div>
      {message && !compact && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}

      {suggestedAmounts.length > 0 && (
        <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", compact ? "mt-3" : "mt-5 gap-2.5")}>
          {suggestedAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? "default" : "outline"}
              size={amountButtonSize}
              disabled={isPending}
              onClick={() => handleSuggestedAmount(amount)}
              className={compact ? "text-sm font-semibold" : "text-base font-semibold"}
            >
              {formatCurrency(amount)}
            </Button>
          ))}
          <Button
            type="button"
            variant={isCustomAmountActive ? "default" : "outline"}
            size={amountButtonSize}
            disabled={isPending}
            onClick={handleChooseCustomAmount}
            className={compact ? "text-sm font-semibold" : "text-base font-semibold"}
          >
            Escolha o valor
          </Button>
        </div>
      )}

      {showCustomAmountInput && (
        <form onSubmit={handleCustomAmountSubmit} className="mt-3 flex gap-2">
          <Input
            ref={customAmountInputRef}
            type="text"
            inputMode="decimal"
            placeholder="Digite o valor (R$)"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            disabled={isPending}
            className={compact ? "text-sm" : "h-11 text-base"}
          />
          <Button type="submit" size={amountButtonSize} disabled={isPending}>
            Gerar
          </Button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div
        className={cn(
          "mt-6 flex flex-col items-center gap-3 rounded-panel bg-accent/14",
          compact ? "mt-4 gap-2 p-3" : "p-4 sm:p-5",
        )}
      >
        <div
          className={cn(
            "w-full rounded-panel border-2 bg-background p-3 ui-motion-emphasis [&_svg]:h-auto [&_svg]:w-full",
            qrMaxWidthClass,
            justUpdated ? "border-primary ring-4 ring-primary/30" : "border-border ring-0",
            isPending && "opacity-40",
          )}
          // SVG vem de qrcode.toString() no servidor, codificando só o payload BR Code que este
          // mesmo plugin monta (shared/pix-br-code.ts) — não é HTML de usuário.
          dangerouslySetInnerHTML={{ __html: code.qrSvg }}
        />
        {justUpdated && !isPending && (
          <p className="text-xs font-medium text-primary">Código atualizado — escaneie novamente</p>
        )}
        <p className={cn("text-center font-medium text-foreground", compact ? "text-sm" : "text-base")}>
          {code.amount != null ? (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
              {formatCurrency(code.amount)}
            </span>
          ) : compact ? (
            "Valor livre"
          ) : (
            "Valor livre — informe o quanto quiser doar no app do seu banco."
          )}
        </p>
        <Button
          type="button"
          size={amountButtonSize}
          onClick={handleCopy}
          disabled={isPending}
          className={cn("w-full gap-2", qrMaxWidthClass, copied && "bg-success text-success-foreground hover:bg-success")}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copiado!" : compact ? "Copiar código" : "Copiar código Pix Copia e Cola"}
        </Button>
      </div>
    </div>
  );
}
