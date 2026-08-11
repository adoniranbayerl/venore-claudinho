"use client";

import { useEffect, useState, type ReactNode } from "react";
// Tipo importado direto da feature, não do barrel (@/plugins/broadcast) — mesmo racional de
// layer-renderer.tsx: este é um "use client" component, e o barrel arrasta handlers server-only
// pro bundle do browser.
import type { BroadcastOutputState } from "@/plugins/broadcast/features/outputs/get-output-state/types";
import { AlertBanner, LayerRenderer } from "./layer-renderer";

// Duração da troca de cena é comportamento do plugin, não decisão de design de marca (mesmo
// racional do GEOMETRY_TRANSITION em layer-renderer.tsx) — fica como constante local.
const SCENE_FADE_MS = 400;

// Rede de segurança independente do SSE: se por qualquer motivo de ambiente (proxy reverso
// bufferizando o stream, etc.) um evento não chegar, a TV nunca fica desatualizada por mais que
// esse intervalo — não depende de ninguém apertar F5.
const FALLBACK_POLL_MS = 15_000;

// Animação CSS pura (@keyframes broadcast-scene-fade, ver <style> abaixo), não mais um
// useState+useEffect setando opacity depois do mount. Achado real: numa TV com engine JS
// desatualizada/bundle que falha ao carregar, o opacity:0 inicial (que o SSR já manda pronto no
// HTML) nunca virava opacity:1 — tela ficava permanentemente em branco, mesmo com o HTML/CSS
// tendo chegado certinho. Uma animação CSS roda sozinha ao pintar o DOM, sem depender de nenhum
// JS — e se o navegador nem suportar @keyframes (caso extremo), o elemento cai no estado padrão
// (sem opacity declarado fora da animação = visível), nunca no inverso.
function SceneFade({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0" style={{ animation: `broadcast-scene-fade ${SCENE_FADE_MS}ms ease both` }}>
      {children}
    </div>
  );
}

export function OutputCanvas({ token, initialState }: { token: string; initialState: BroadcastOutputState }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const refetchState = async () => {
      try {
        const response = await fetch(`/api/broadcast/output/${token}/state`, { cache: "no-store" });
        if (response.ok) setState(await response.json());
      } catch {
        // Uma falha pontual de refetch só deixa o quadro atual na tela até o próximo evento —
        // EventSource já reconecta sozinho por spec, não precisa de retry manual aqui.
      }
    };

    // EventSource não é garantido em engines de TV mais antigas — se a API não existir ou a
    // criação falhar, a atualização cai inteiramente no polling abaixo. Isso precisa vir DEPOIS
    // do polling estar registrado (ou num try/catch que não interrompe o resto do efeito): um
    // `new EventSource(...)` que lança como primeira linha do efeito pulava tudo que vinha
    // depois, inclusive o setInterval de segurança — a própria rede de segurança nunca chegava a
    // existir.
    let eventSource: EventSource | null = null;
    if (typeof EventSource !== "undefined") {
      try {
        eventSource = new EventSource(`/api/broadcast/output/${token}/events`);
        eventSource.onmessage = (event) => {
          const message = JSON.parse(event.data) as { type: string; state?: BroadcastOutputState };
          if (message.type === "state" && message.state) {
            setState(message.state);
            return;
          }
          void refetchState();
        };
      } catch {
        eventSource = null;
      }
    }

    const pollInterval = setInterval(() => void refetchState(), FALLBACK_POLL_MS);

    return () => {
      eventSource?.close();
      clearInterval(pollInterval);
    };
  }, [token]);

  // "alert" nunca vem do mapa de layers normal — vira um irmão de altura natural no fim da coluna
  // flex (ver AlertBanner), pra empurrar o layout em vez de sobrepor (pedido explícito: "quando a
  // barra de aviso aparece, ela não deve sobrepor nada, ela deve empurrar").
  const contentLayers = state.layers.filter((layer) => layer.type !== "alert");
  // A coluna de agenda só fica de fato aberta quando drawerOpen=true E existe alguma agenda com
  // evento futuro pra mostrar — pedido explícito: "se não houver agenda ativa, feche a agenda no
  // View". agendaRotation já vem [] tanto quando drawerOpen=false (get-output-state nem resolve)
  // quanto quando está aberta mas nenhuma agenda tem evento futuro — os dois casos devem fechar a
  // coluna e devolver a largura pro vídeo, não só o primeiro. Reabre sozinho assim que alguma
  // agenda ganhar um evento futuro de novo, sem precisar de ação manual.
  const effectiveDrawerOpen = state.drawerOpen && state.agendaRotation.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      {/* Keyframes usados por AgendaLayer/AlertBanner/NewsSlideCard (layer-renderer.tsx) —
          definidos uma vez aqui no root do canvas em vez de um <style> por instância de layer. */}
      <style>
        {"@keyframes broadcast-scene-fade { from { opacity: 0; } to { opacity: 1; } }" +
          "@keyframes broadcast-agenda-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }" +
          // Item de evento entrando deslizado da DIREITA — usado com animation-delay crescente por
          // item (ver AgendaLayer) pra virar uma cascata em sequência, não os cards inteiros
          // aparecendo juntos. Estilo alternativo ao fade acima (BROADCAST_SETTINGS.agendaAnimationStyle).
          // Distância grande (64px) + easing com leve overshoot ("ease-emphasis", mesma curva
          // usada nos temas shadcn do projeto) — pedido explícito: "mais expressiva", não um
          // deslize discreto.
          "@keyframes broadcast-agenda-cascade-item { from { opacity: 0; transform: translateX(64px); } to { opacity: 1; transform: translateX(0); } }" +
          "@keyframes broadcast-alert-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }" +
          "@keyframes broadcast-news-title-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }" +
          "@keyframes broadcast-news-parallax { from { transform: scale(1) translate(0, 0); } to { transform: scale(1.1) translate(-2%, -2%); } }"}
      </style>
      {/* Região que hospeda as camadas posicionadas por percentual (video/agenda/etc) — altura
          FLEXÍVEL (min-h-0 flex-1), encolhe sozinha quando o alerta abaixo ocupa espaço, sem
          precisar de nenhum cálculo manual de "altura restante": os `left/top/width/height: %` de
          cada LayerRenderer já são relativos a esta caixa, não à tela inteira. O footer não mora
          mais aqui em cima (canvas inteiro) — foi pra dentro da própria camada "video" (ver
          VideoZoneLayer em layer-renderer.tsx), pra só ocupar a largura do vídeo, nunca a da
          agenda — pedido explícito: "o Footer fica APENAS na parte da view do Vídeo, a Agenda vai
          do canto superior até o inferior". */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <SceneFade key={state.scene?.id ?? "empty"}>
          {contentLayers.map((layer) => (
            <LayerRenderer
              key={layer.id}
              layer={layer}
              drawerOpen={effectiveDrawerOpen}
              playlistItemsByPlaylistId={state.playlistItemsByPlaylistId}
              resolvedAssetUrlByLayerId={state.resolvedAssetUrlByLayerId}
              regionWeather={state.regionWeather}
              regionNews={state.regionNews}
              agendaRotation={state.agendaRotation}
              brandLogoUrl={state.brandLogoUrl}
              brandColor={state.brandColor}
              agendaAnimationStyle={state.agendaAnimationStyle}
              agendaViewSize={state.agendaViewSize}
              footerOpen={state.footerOpen}
            />
          ))}
        </SceneFade>
      </div>
      <AlertBanner message={state.activeAlertMessage} />
    </div>
  );
}
