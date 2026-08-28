"use client";

import { resolveContrastPalette } from "./contrast-palette";

export type StandbyReason = "admin" | "no-content" | "disconnected";

// Um texto por motivo — pedido explícito da Fase 11. Um só componente parametrizado.
const STANDBY_STATUS_TEXT: Record<StandbyReason, string> = {
  admin: "Tela em modo de espera",
  "no-content": "Nenhum conteúdo programado",
  disconnected: "Sem conexão com o servidor — reconectando…",
};

// Legenda secundária, calma, por motivo — só preenche a composição abaixo do título; nunca promete
// um tempo de retorno (a tela pode ficar horas assim).
const STANDBY_CAPTION_TEXT: Record<StandbyReason, string> = {
  admin: "Transmissão pausada pelo operador",
  "no-content": "Aguardando a próxima programação",
  disconnected: "Tentando restabelecer o sinal",
};

// Fallback branded pra quando a saída não está exibindo conteúdo (Fase 11) — três motivos, um só
// componente (ver components/output/output-canvas.tsx pros três pontos de uso):
//  - "admin": o operador ligou "Tela offline" no card da tela (output.offline, via SSE);
//  - "no-content": a camada de vídeo não tem playlist cadastrada, ou a playlist não tem nenhum
//    item de vídeo (só imagem/página/notícia) — o canal é essencialmente vídeo (ver PlaylistLayer
//    em layer-renderer.tsx); substitui o texto cru que a PlaylistLayer mostrava antes;
//  - "disconnected": a TV perdeu contato com o servidor (SSE + poll falhando) — entra como overlay
//    sobre o último quadro e sai sozinha quando a sincronização volta.
//
// Redesign "premium" (pedidos: "design mais arrojado, background com textura, animação", depois
// "o brand deve ficar como assinatura, o texto de aviso está com alinhamento estranho, faltou
// cor"):
//  - O FOCO é a mensagem de status, centrada numa coluna única (indicador → título → legenda →
//    trilho), tudo `text-align: center` — sem o ponto inline ao lado do texto que quebrava o
//    alinhamento quando o título quebrava em duas linhas.
//  - A LOGO virou assinatura: pequena, discreta, no rodapé — não é mais o herói central.
//  - COR: as auroras deixaram de ser tint claro/escuro da marca e ganharam matiz própria (a cor
//    da marca girada ~±38° e re-saturada). Marca quase-cinza cai num azul-violeta agradável em
//    vez de ficar sem cor nenhuma. O campo, o trilho e o indicador puxam esse mesmo acento.
//
// Contrato de degradação (TVs antigas, ver memória "Browserslist for smart TVs"): TUDO que é
// textura/animação é decorativo (`radial-gradient` / filtro SVG / `@keyframes` / `hsla`). Motor
// que não suporta → cada camada some sem quebrar nada e sobra `backgroundColor: brandColor`
// sólido + título + legenda + logo legíveis, estáticos. `prefers-reduced-motion` também zera as
// animações (ver <style>).
//
// Vive sobre o palco escalado das Fases 1-2 (`absolute inset-0` preenche a caixa do palco):
// unidade proporcional em px de composição (referência 1920×1080), `style` inline pra cor (fora do
// vocabulário shadcn de propósito, mesmo racional do resto deste canvas), sem breakpoints. Os
// `@keyframes` são locais a este componente pra ele continuar íntegro renderizado fora do canvas
// (ex.: SSR direto).

// Cor de marca (hex livre do operador) → RGB, com fallback pro mesmo quase-preto do
// resolveContrastPalette quando o hex é inválido.
function parseRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return [15, 15, 15];
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

// RGB (0-255) → HSL (h em graus, s/l em 0-1). Só o matiz e a saturação interessam aqui, pra
// derivar as cores de acento a partir da marca.
function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

// Desloca a cor em direção ao preto (target 0) ou branco (target 255) por uma fração — pra derivar
// o topo iluminado e o fundo escuro do campo a partir da cor de marca.
function shiftColor([r, g, b]: [number, number, number], target: 0 | 255, amount: number): string {
  const c = (v: number) => Math.round(v + (target - v) * amount);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

// Ruído fractal como data URI SVG — textura de filme fina, estática (mais barata que animar), sem
// asset externo. `feTurbulence` degrada pra nada em motores que não o suportam.
const NOISE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const STANDBY_KEYFRAMES =
  "@keyframes broadcast-standby-breathe { 0%, 100% { opacity: 0.82; transform: scale(1); } 50% { opacity: 1; transform: scale(1.015); } }" +
  "@keyframes broadcast-standby-fade-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }" +
  // Flutuar de leve o bloco herói inteiro — 6px, sem mexer em opacidade (um pulse de opacidade
  // num título de 84px lê como flicker na TV).
  "@keyframes broadcast-standby-hero { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }" +
  // Auroras: deriva ampla, escala pulsando de leve — ciclo de 18-24s: presença perceptível sem
  // virar um movimento nervoso numa tela ligada por horas.
  "@keyframes broadcast-standby-drift-a { 0% { transform: translate3d(0,0,0) scale(1); } 33% { transform: translate3d(6%,-4%,0) scale(1.12); } 66% { transform: translate3d(-4%,5%,0) scale(1.04); } 100% { transform: translate3d(0,0,0) scale(1); } }" +
  "@keyframes broadcast-standby-drift-b { 0% { transform: translate3d(0,0,0) scale(1.05); } 50% { transform: translate3d(-7%,-6%,0) scale(1.2); } 100% { transform: translate3d(0,0,0) scale(1.05); } }" +
  // Grelha de pontos rastejando 1 célula por ciclo — movimento contínuo, imperceptível quadro a
  // quadro, mas mantém a textura "viva".
  "@keyframes broadcast-standby-grid-pan { from { background-position: 0 0; } to { background-position: 56px 56px; } }" +
  // Brilho correndo no trilho de status.
  "@keyframes broadcast-standby-sheen { 0% { transform: translateX(-160%); } 100% { transform: translateX(260%); } }" +
  "@keyframes broadcast-standby-pulse-dot { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }" +
  "@keyframes broadcast-standby-pulse-ring { 0% { opacity: 0.5; transform: scale(0.6); } 80%, 100% { opacity: 0; transform: scale(4.6); } }" +
  "@media (prefers-reduced-motion: reduce) { [data-broadcast-standby], [data-broadcast-standby] * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; } }";

function StatusIndicator({ color }: { color: string }) {
  return (
    <span style={{ position: "relative", width: 16, height: 16, flex: "none" }}>
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          border: `2px solid ${color}`,
          animation: "broadcast-standby-pulse-ring 2.4s ease-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 999,
          background: color,
          animation: "broadcast-standby-pulse-dot 2.4s ease-in-out infinite",
        }}
      />
    </span>
  );
}

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
  const rgb = parseRgb(brandColor);
  const [hue, sat] = rgbToHsl(rgb);

  // Cor de acento derivada da marca: matiz girada, saturação reforçada. Marca quase-cinza
  // (sat < 12%) cai num azul-violeta agradável em vez de ficar sem cor nenhuma.
  const nearGray = sat < 0.12;
  const baseHue = nearGray ? 226 : hue;
  const satA = nearGray ? 72 : Math.min(90, Math.round(sat * 100 * 1.45));
  const satB = nearGray ? 66 : Math.min(84, Math.round(sat * 100 * 1.3));
  const accentA = (light: number, alpha = 1) =>
    `hsla(${Math.round((baseHue + 38) % 360)}, ${satA}%, ${light}%, ${alpha})`;
  const accentB = (light: number, alpha = 1) =>
    `hsla(${Math.round((baseHue - 40 + 360) % 360)}, ${satB}%, ${light}%, ${alpha})`;
  const accentSolid = accentA(64);

  const brandDeep = shiftColor(rgb, 0, 0.58);
  const brandLift = shiftColor(rgb, 255, palette.isLight ? 0.06 : 0.18);
  const dotColor = palette.isLight ? "rgba(20,20,43,0.06)" : "rgba(255,255,255,0.05)";
  const trackBase = palette.isLight ? "rgba(20,20,43,0.12)" : "rgba(255,255,255,0.14)";
  const noiseBlend: "multiply" | "overlay" = palette.isLight ? "multiply" : "overlay";
  const edgeMask = "radial-gradient(ellipse 75% 75% at 50% 45%, #000 0%, transparent 78%)";

  // Campo de fundo: dois brilhos de acento saturado nos cantos + gradiente diagonal da marca.
  // Vai em `backgroundImage` (não `background`) pra `backgroundColor` sólido sobreviver como
  // fallback num motor que não parseie `radial-gradient`.
  const fieldImage = [
    `radial-gradient(120% 120% at 22% 10%, ${accentA(22, 0.6)} 0%, transparent 46%)`,
    `radial-gradient(130% 120% at 88% 96%, ${accentB(16, 0.62)} 0%, transparent 56%)`,
    `linear-gradient(155deg, ${brandLift} 0%, ${brandColor} 46%, ${brandDeep} 100%)`,
  ].join(", ");

  return (
    <div
      data-broadcast-standby
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: brandColor, backgroundImage: fieldImage }}
    >
      <style>{STANDBY_KEYFRAMES}</style>

      {/* Auroras coloridas — cor de acento, muito desfocada, deriva lenta. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-24%",
            left: "-14%",
            width: "64%",
            height: "74%",
            background: `radial-gradient(circle at 50% 50%, ${accentA(58, 0.5)} 0%, transparent 70%)`,
            filter: "blur(90px)",
            animation: "broadcast-standby-drift-a 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-28%",
            right: "-16%",
            width: "68%",
            height: "80%",
            background: `radial-gradient(circle at 50% 50%, ${accentB(48, 0.5)} 0%, transparent 70%)`,
            filter: "blur(100px)",
            animation: "broadcast-standby-drift-b 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: "50%",
            width: "46%",
            height: "46%",
            transform: "translateX(-50%)",
            background: `radial-gradient(circle at 50% 50%, ${accentA(62, 0.26)} 0%, transparent 68%)`,
            filter: "blur(80px)",
            animation: "broadcast-standby-drift-a 24s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Grelha de pontos — textura fina, some nas bordas, rasteja continuamente. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1.6px)`,
          backgroundSize: "56px 56px",
          maskImage: edgeMask,
          WebkitMaskImage: edgeMask,
          animation: "broadcast-standby-grid-pan 44s linear infinite",
        }}
      />

      {/* Ruído — textura de filme, estática, misturada com o campo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: NOISE_TEXTURE,
          backgroundSize: "180px 180px",
          opacity: palette.isLight ? 0.28 : 0.2,
          mixBlendMode: noiseBlend,
        }}
      />

      {/* Vinheta — fecha as bordas, foca o centro. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 94% 94% at 50% 42%, transparent 32%, ${brandDeep} 100%)`,
          opacity: 0.88,
        }}
      />

      {/* Conteúdo central — coluna única centrada, o foco da tela. */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ padding: "0 8%", animation: "broadcast-standby-fade-in 1.1s ease both" }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{ zIndex: 1, gap: 34, animation: "broadcast-standby-hero 7s ease-in-out infinite" }}
        >
          <StatusIndicator color={accentSolid} />

          <p
            className="font-semibold"
            style={{
              color: palette.foreground,
              fontSize: 84,
              lineHeight: 1.1,
              maxWidth: 1360,
              letterSpacing: "-0.01em",
              textShadow: palette.isLight ? "none" : "0 2px 32px rgba(0,0,0,0.42)",
            }}
          >
            {STANDBY_STATUS_TEXT[reason]}
          </p>

          <p
            style={{
              color: palette.muted,
              fontSize: 26,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            {STANDBY_CAPTION_TEXT[reason]}
          </p>

          {/* Trilho de status: brilho de acento correndo — rápido reconectando, calmo nos
              demais motivos. O overflow recorta o brilho pra ele nascer/morrer dentro do trilho. */}
          <div
            style={{
              position: "relative",
              width: 360,
              height: 3,
              borderRadius: 999,
              background: trackBase,
              overflow: "hidden",
              marginTop: 18,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "42%",
                background: `linear-gradient(90deg, transparent, ${accentSolid}, transparent)`,
                animation: `broadcast-standby-sheen ${reason === "disconnected" ? "1.9s" : "4.6s"} ease-in-out infinite`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Assinatura da marca — pequena e discreta no rodapé, não mais o herói central. */}
      {brandLogoUrl ? (
        <div className="absolute flex justify-center" style={{ left: 0, right: 0, bottom: 80, zIndex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário. */}
          <img
            src={brandLogoUrl}
            alt=""
            style={{
              width: "auto",
              height: 60,
              maxWidth: "40%",
              objectFit: "contain",
              opacity: 0.72,
              animation: "broadcast-standby-breathe 6s ease-in-out infinite",
              // Logo escura sobre marca escura fica invisível — mesma inversão da BrandFooterBar
              // (layer-renderer.tsx); o glow vem antes na cadeia pra sair da forma original.
              filter: palette.isLight
                ? "drop-shadow(0 8px 22px rgba(20,20,43,0.18))"
                : "drop-shadow(0 8px 22px rgba(0,0,0,0.3)) brightness(0) invert(1)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
