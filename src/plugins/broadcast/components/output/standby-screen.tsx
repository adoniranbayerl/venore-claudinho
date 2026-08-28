"use client";

import { resolveContrastPalette } from "./contrast-palette";

export type StandbyReason = "admin" | "no-content" | "disconnected";

// Um texto por motivo — pedido explícito da Fase 11. Um só componente parametrizado.
const STANDBY_STATUS_TEXT: Record<StandbyReason, string> = {
  admin: "Tela em modo de espera",
  "no-content": "Nenhum conteúdo programado",
  disconnected: "Sem conexão com o servidor — reconectando…",
};

// Fallback branded pra quando a saída não está exibindo conteúdo (Fase 11) — três motivos, um só
// componente (ver components/output/output-canvas.tsx pros três pontos de uso):
//  - "admin": o operador ligou "Tela offline" no card da tela (output.offline, via SSE);
//  - "no-content": a camada de vídeo não tem nenhum item resolvível (substitui o texto cru que a
//    PlaylistLayer mostrava antes);
//  - "disconnected": a TV perdeu contato com o servidor (SSE + poll falhando) — entra como overlay
//    sobre o último quadro e sai sozinha quando a sincronização volta.
//
// Vive sobre o palco escalado das Fases 1-2 (`absolute inset-0` preenche a caixa do palco):
// unidade proporcional em px de composição (referência 1920×1080), `style` inline pra cor (fora do
// vocabulário shadcn de propósito, mesmo racional do resto deste canvas), sem breakpoints. A
// "respiração" lenta é @keyframes `broadcast-standby-breathe`, definida no <style> do canvas
// (output-canvas.tsx) — calma o bastante pra ficar horas ligada, sem spinner pesado. Renderizada
// fora do canvas (ex.: SSR direto) o elemento continua visível e legível, só não respira.
export function StandbyScreen({
  reason,
  brandLogoUrl,
  brandColor,
}: {
  reason: StandbyReason;
  brandLogoUrl: string | null;
  brandColor: string;
}) {
  const palette = resolveContrastPalette(brandColor);
  const breathe = "broadcast-standby-breathe 5s ease-in-out infinite";

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: brandColor, gap: 64 }}
    >
      {brandLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário.
        <img
          src={brandLogoUrl}
          alt=""
          style={{
            width: "auto",
            height: 300,
            maxWidth: "56%",
            objectFit: "contain",
            animation: breathe,
            // Logo escura sobre cor de marca escura fica invisível — mesma inversão que a
            // BrandFooterBar já usa (layer-renderer.tsx).
            ...(palette.isLight ? {} : { filter: "brightness(0) invert(1)" }),
          }}
        />
      ) : null}
      <p
        className="text-center font-semibold tracking-tight"
        style={{
          color: palette.foreground,
          fontSize: 52,
          maxWidth: "72%",
          // Sem logo, o texto é o único elemento na tela — respira ele mesmo pra não ficar 100%
          // estático por horas.
          animation: brandLogoUrl ? undefined : breathe,
        }}
      >
        {STANDBY_STATUS_TEXT[reason]}
      </p>
    </div>
  );
}
