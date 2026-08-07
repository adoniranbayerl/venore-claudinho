"use client";

import { useEffect, useState, type ReactNode } from "react";
// Tipo importado direto da feature, não do barrel (@/plugins/broadcast) — mesmo racional de
// layer-renderer.tsx: este é um "use client" component, e o barrel arrasta handlers server-only
// pro bundle do browser.
import type { BroadcastOutputState } from "@/plugins/broadcast/features/outputs/get-output-state/types";
import { LayerRenderer } from "./layer-renderer";

// Duração da troca de cena é comportamento do plugin, não decisão de design de marca (mesmo
// racional do GEOMETRY_TRANSITION em layer-renderer.tsx) — fica como constante local.
const SCENE_FADE_MS = 400;

// Rede de segurança independente do SSE: se por qualquer motivo de ambiente (proxy reverso
// bufferizando o stream, etc.) um evento não chegar, a TV nunca fica desatualizada por mais que
// esse intervalo — não depende de ninguém apertar F5.
const FALLBACK_POLL_MS = 15_000;

// Componente próprio (não useEffect resetando estado num pai) pra evitar
// react-hooks/set-state-in-effect: ao remontar via key={sceneId} na troca de cena, `visible`
// nasce false de novo naturalmente, e o efeito só assina um timeout, nunca seta estado síncrono
// no corpo do efeito.
function SceneFade({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="absolute inset-0" style={{ opacity: visible ? 1 : 0, transition: `opacity ${SCENE_FADE_MS}ms ease` }}>
      {children}
    </div>
  );
}

export function OutputCanvas({ token, initialState }: { token: string; initialState: BroadcastOutputState }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const eventSource = new EventSource(`/api/broadcast/output/${token}/events`);

    const refetchState = async () => {
      try {
        const response = await fetch(`/api/broadcast/output/${token}/state`, { cache: "no-store" });
        if (response.ok) setState(await response.json());
      } catch {
        // Uma falha pontual de refetch só deixa o quadro atual na tela até o próximo evento —
        // EventSource já reconecta sozinho por spec, não precisa de retry manual aqui.
      }
    };

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data) as { type: string; state?: BroadcastOutputState };
      if (message.type === "state" && message.state) {
        setState(message.state);
        return;
      }
      void refetchState();
    };

    const pollInterval = setInterval(() => void refetchState(), FALLBACK_POLL_MS);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [token]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Keyframes usados por AgendaLayer/AlertBanner/NewsSlideCard (layer-renderer.tsx) —
          definidos uma vez aqui no root do canvas em vez de um <style> por instância de layer. */}
      <style>
        {"@keyframes broadcast-agenda-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }" +
          "@keyframes broadcast-alert-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }" +
          "@keyframes broadcast-news-title-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }" +
          "@keyframes broadcast-news-parallax { from { transform: scale(1) translate(0, 0); } to { transform: scale(1.08) translate(-1.5%, -1.5%); } }"}
      </style>
      <SceneFade key={state.scene?.id ?? "empty"}>
        {state.layers.map((layer) => (
          <LayerRenderer
            key={layer.id}
            layer={layer}
            drawerOpen={state.drawerOpen}
            playlistItemsByPlaylistId={state.playlistItemsByPlaylistId}
            resolvedAssetUrlByLayerId={state.resolvedAssetUrlByLayerId}
            regionWeather={state.regionWeather}
            regionNews={state.regionNews}
            agendaRotation={state.agendaRotation}
            activeAlertMessage={state.activeAlertMessage}
            brandLogoUrl={state.brandLogoUrl}
          />
        ))}
      </SceneFade>
    </div>
  );
}
