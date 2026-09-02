"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

// iOS/Safari não dispara `beforeinstallprompt` — a instalação é 100% manual (Compartilhar →
// "Adicionar à Tela de Início"). Este é só o lembrete, dispensável e lembrado no localStorage.
// Android/Chrome não vê nada disto: lá o próprio navegador oferece "Instalar".
const DISMISS_KEY = "pwa-ios-hint-dismissed";

export function IosInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // A detecção depende de APIs do browser (navigator/matchMedia) — roda fora do corpo do efeito
    // (setTimeout) pra não ser um setState síncrono no efeito.
    const id = window.setTimeout(() => {
      const ua = window.navigator.userAgent;
      const isIOS = /iphone|ipad|ipod/i.test(ua) && !("MSStream" in window);
      if (!isIOS) return;

      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      if (standalone) return;

      try {
        if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
      } catch {
        // localStorage indisponível (aba privada etc.) — mostra mesmo assim
      }
      setShow(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignora
    }
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-start gap-3 rounded-panel border border-border bg-card p-3 text-sm text-foreground shadow-float">
      <Share className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p className="flex-1">
        Instale o app: toque em <span className="font-medium">Compartilhar</span> e depois em{" "}
        <span className="font-medium">Adicionar à Tela de Início</span>.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dispensar"
        className="-m-1 rounded-md p-1 text-muted-foreground outline-none ui-motion-base hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
