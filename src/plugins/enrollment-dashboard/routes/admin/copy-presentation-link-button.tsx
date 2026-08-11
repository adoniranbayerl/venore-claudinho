"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mesmo padrão de CopyOutputUrlButton (broadcast/components/admin/outputs-section.tsx): monta a
// URL absoluta no client (window.location.origin) porque o Server Component não conhece o host
// externo de forma confiável (proxy/domínio custom). Um botão por instituição — as duas telas de
// apresentação são rotas separadas agora (pedido explícito: colégio e faculdade em telões
// diferentes), cada uma com seu próprio link.
export function CopyPresentationLinkButton({ token, institutionKey, label }: { token: string; institutionKey: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/enrollment-dashboard/present/${token}/${institutionKey}`;

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
      {copied ? "Link copiado" : `Copiar link — ${label}`}
    </Button>
  );
}
