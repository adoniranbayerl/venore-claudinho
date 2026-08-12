import { cn } from "@/lib/utils";

// Logo sem caixa (sem borda/fundo/padding) — pedido explícito: "logo fora do box que ela está
// agora, e tamanho normal". Dimensiona por altura (h-*), largura livre (w-auto): a logo do
// colégio (emblema, quase quadrado) e a da faculdade (wordmark, mais larga) têm proporções bem
// diferentes, uma caixa quadrada forçava as duas a um recorte artificial. Vale pras duas telas do
// dashboard (admin e apresentação) — nenhuma passa mais borda/fundo, só altura.
export function InstitutionLogo({ url, name, className }: { url: string | null; name: string; className?: string }) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        {name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()}
      </div>
    );
  }

  return (
    // URL vem de Vercel Blob, domínio não configurado em next.config.ts remotePatterns (mesmo padrão de account/_components/avatar-form.tsx).
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`Logo — ${name}`} className={cn("h-12 w-auto shrink-0 object-contain", className)} />
  );
}
