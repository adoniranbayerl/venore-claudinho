"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mesmo padrão de CopyOutputUrlButton (broadcast/components/admin/outputs-section.tsx): monta a
// URL absoluta no client (window.location.origin) porque o Server Component não conhece o host
// externo de forma confiável (proxy/domínio custom). Um botão por instituição — as duas telas de
// apresentação são rotas separadas agora (pedido explícito: colégio e faculdade em telões
// diferentes), cada uma com seu próprio link. mode vai como query string (?modo=) — quem projeta
// escolhe, ao copiar o link, se quer a versão detalhada (por turma/curso) ou só o resumo geral
// (pedido explícito: alternância manual entre as duas views, não automática).
export function CopyPresentationLinkButton({
  token,
  institutionKey,
  mode,
  label,
}: {
  token: string;
  institutionKey: string;
  mode: "detalhada" | "resumida";
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const path = `/enrollment-dashboard/present/${token}/${institutionKey}?modo=${mode}`;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Link copiado" : `${label} — ${mode === "detalhada" ? "detalhada" : "resumida"}`}
    </Button>
  );
}
