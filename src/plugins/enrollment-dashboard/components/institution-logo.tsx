import { cn } from "@/lib/utils";

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
    <img src={url} alt={`Logo — ${name}`} className={cn("size-12 shrink-0 rounded-md border border-border bg-card object-contain p-1", className)} />
  );
}
