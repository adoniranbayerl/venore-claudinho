"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyTvLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/company-metrics/tv/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado. Cole como item “webpage” numa playlist do Broadcast Studio.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente: " + url);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy}>
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      Copiar link da TV
    </Button>
  );
}
