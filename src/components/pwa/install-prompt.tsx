"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Banner de instalação, dispensável e lembrado no localStorage. Dois caminhos:
//  - Android/Chrome: intercepta `beforeinstallprompt` e mostra um botão "Instalar" de verdade.
//  - iOS/Safari: não dispara evento nenhum — só um lembrete de "Compartilhar → Adicionar à Tela".
// Nada aparece se o app já está em modo standalone (já instalado).
const DISMISS_KEY = "pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "android" | "ios";

export function InstallPrompt() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // localStorage indisponível — segue mostrando
    }
    if (dismissed) return;

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("android");
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setMode("hidden"));

    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !("MSStream" in window);
    // iOS nunca dispara beforeinstallprompt; mostra o lembrete depois de um tick (fora do corpo
    // do efeito, pra não ser setState síncrono).
    const iosTimer = isIOS
      ? window.setTimeout(() => setMode((current) => (current === "hidden" ? "ios" : current)), 0)
      : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  if (mode === "hidden") return null;

  function dismiss() {
    setMode("hidden");
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignora
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setMode("hidden");
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-start gap-3 rounded-panel border border-border bg-card p-3 text-sm text-foreground shadow-float [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
      {mode === "android" ? (
        <>
          <Download className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="flex-1">Instale o app na tela inicial para abrir mais rápido e em tela cheia.</p>
          <Button type="button" size="sm" onClick={install}>
            Instalar
          </Button>
        </>
      ) : (
        <>
          <Share className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="flex-1">
            Instale o app: toque em <span className="font-medium">Compartilhar</span> e depois em{" "}
            <span className="font-medium">Adicionar à Tela de Início</span>.
          </p>
        </>
      )}
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
