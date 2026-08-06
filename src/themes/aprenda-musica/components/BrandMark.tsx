import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

// Marca própria do tema — pedido desta sessão: "não vou utilizar .svg, vamos utilizar aquele
// brand ali" (o ícone + nome que apareceu no preview). Por isso `mode: "text"` no manifest
// (manifest.ts) em vez de "svg"/"png": não existe asset de logo pra consumir (logoUrl/
// scrolledLogoUrl de HeaderBrand nunca são lidos aqui, mesmo precedente de outros temas aceitando
// campo do contrato sem usar). `name` continua vindo de brand.name (contexts/settings via
// getBrandConfig) — só o ícone é fixo no código, o texto acompanha o nome do site configurado em
// /admin/settings/brand.
export function BrandMark({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-primary text-primary-foreground",
          size === "sm" ? "size-6" : "size-7",
        )}
      >
        <Music className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" />
      </span>
      <span className={cn("truncate font-semibold tracking-tight text-foreground", size === "sm" ? "text-sm" : "text-[15px]")}>
        {name}
      </span>
    </span>
  );
}
