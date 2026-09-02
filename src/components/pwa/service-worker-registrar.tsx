"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Registra public/sw.js e avisa quando há uma versão nova esperando (o SW usa skipWaiting, então
// "nova versão" = novo SW instalado enquanto um antigo ainda controla a aba). Só em produção: em
// dev o SW atrapalha o HMR do Turbopack e não agrega nada.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        function promptUpdate(worker: ServiceWorker | null) {
          if (!worker) return;
          toast("Nova versão disponível", {
            description: "Recarregue para atualizar o app.",
            duration: Infinity,
            action: { label: "Atualizar", onClick: () => worker.postMessage({ type: "SKIP_WAITING" }) },
          });
        }

        if (registration.waiting && navigator.serviceWorker.controller) {
          promptUpdate(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              promptUpdate(installing);
            }
          });
        });
      })
      .catch(() => {
        // sem SW o app só perde o modo offline — não é erro pro usuário
      });
  }, []);

  return null;
}
