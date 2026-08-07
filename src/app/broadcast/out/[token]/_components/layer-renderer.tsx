"use client";

import { useEffect, useRef, useState } from "react";
// Importa direto de contracts/ e shared/, nunca do barrel (@/plugins/broadcast) — este é um "use
// client" component, e o barrel reexporta handlers server-only (Drizzle/pg) que quebram o bundle
// do browser mesmo quando só o tipo é usado aqui (achado real do `next build`, não teórico).
import { resolveLayerGeometry, type LayerGeometry } from "@/plugins/broadcast/shared/layer-geometry";
import type {
  AgendaRotationEntry,
  BroadcastLayerRecord,
  PlaylistItemSummary,
  RegionNewsArticle,
  RegionWeather,
} from "@/plugins/broadcast/contracts/types";

function readString(config: Record<string, unknown>, key: string): string | null {
  const value = config[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readGeometry(config: Record<string, unknown>): Partial<LayerGeometry> | undefined {
  const value = config.drawerVariant;
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const geometry: Partial<LayerGeometry> = {};
  for (const key of ["x", "y", "width", "height"] as const) {
    if (typeof record[key] === "number") geometry[key] = record[key] as number;
  }
  return geometry;
}

// Duração/easing da transição de geometria é comportamento próprio do plugin (não decisão de
// design de marca — AGENTS.md seção 3 trata disso pra tokens shadcn/globals.css, não pra
// animação operacional de um canvas de saída que nem passa pelo tema), por isso vive como
// constante aqui, não em theme.css. Cor branca/preta neste arquivo é sempre inline `style`, nunca
// `className` — é overlay fixo sobre vídeo, não deve variar com o tema shadcn do admin (mesmo
// racional de layer "text" usar config.color por instância).
const GEOMETRY_TRANSITION = "left 400ms ease, top 400ms ease, width 400ms ease, height 400ms ease";
// Rotação interna de manchete dentro de um bloco de notícias (tanto a layer "news" standalone
// quanto o slide "news" dentro da playlist usam o mesmo componente/timer). O teto do bloco inteiro
// (quantos segundos o slide "news" fica no ar dentro do rodízio da playlist) é outra coisa — vem
// de PlaylistItemSummary.durationSeconds (editável por item, default DEFAULT_NEWS_BLOCK_DURATION_
// SECONDS em shared/playback-defaults.ts), não uma constante fixa aqui.
const NEWS_ARTICLE_ROTATION_MS = 6000;
// z-index da layer "alert" é sempre o mais alto da tela — "sobrepõe tudo" é literal, não depende
// do zIndex configurado (que continua existindo só pra outros tipos de layer poderem se ordenar
// entre si).
const ALERT_Z_INDEX = 9999;

// Assina um timeout que dispara onDone uma vez — usado por item de playlist "imagem"/"webpage"
// (duração fixa), pela troca de card de notícia e pelo rodízio de agenda. Nunca seta estado
// síncrono no corpo do efeito (react-hooks/set-state-in-effect): só assina o timer, o setState
// acontece no callback. onDone fica numa ref (não nas deps do efeito) pra não precisar remontar o
// timer a cada render só porque o closure mudou de identidade — só durationMs/active devem
// reiniciar a contagem.
function useTimedAdvance(durationMs: number, onDone: () => void, active = true) {
  const onDoneRef = useRef(onDone);

  // Ref só é escrita dentro de efeito (nunca durante o render — react-hooks/refs), roda depois de
  // todo render pra manter a ref sempre com o closure mais recente.
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => onDoneRef.current(), durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs, active]);
}

type PlaylistSlide =
  | { key: string; kind: "video"; itemId: string }
  | { key: string; kind: "image"; itemId: string; durationSeconds: number }
  | { key: string; kind: "webpage"; url: string; durationSeconds: number }
  | { key: string; kind: "news"; durationSeconds: number };

// "news" já chega aqui como mais um item da playlist (sourceType "news", posição/duração próprias
// no admin) — não é mais injetado à parte no fim do rodízio. O texto/imagem de cada manchete vem
// de regionNews (resolvido uma vez por saída), o slide só decide por quanto tempo o bloco inteiro
// fica no ar antes de avançar pro próximo item.
function buildPlaylistSlides(items: PlaylistItemSummary[]): PlaylistSlide[] {
  return items.map((item) =>
    item.kind === "video"
      ? { key: item.id, kind: "video", itemId: item.id }
      : item.kind === "image"
        ? { key: item.id, kind: "image", itemId: item.id, durationSeconds: item.durationSeconds ?? 15 }
        : item.kind === "webpage"
          ? { key: item.id, kind: "webpage", url: item.url ?? "", durationSeconds: item.durationSeconds ?? 60 }
          : { key: item.id, kind: "news", durationSeconds: item.durationSeconds ?? 30 },
  );
}

function PlaylistLayer({ items, newsArticles }: { items: PlaylistItemSummary[]; newsArticles: RegionNewsArticle[] }) {
  const [index, setIndex] = useState(0);
  const slides = buildPlaylistSlides(items);

  const advance = () => setIndex((previous) => (previous + 1) % slides.length);
  const current = slides.length > 0 ? slides[index % slides.length] : null;

  useTimedAdvance(
    current && current.kind !== "video" ? current.durationSeconds * 1000 : 0,
    advance,
    current !== null && current.kind !== "video",
  );

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black" style={{ color: "rgba(255,255,255,0.4)" }}>
        Sem playlist configurada
      </div>
    );
  }

  if (current.kind === "video") {
    return (
      <video
        key={current.key}
        className="h-full w-full object-cover"
        src={`/api/broadcast/stream/${current.itemId}`}
        autoPlay
        muted
        playsInline
        onEnded={advance}
      />
    );
  }

  if (current.kind === "image") {
    // fonte é a rota de stream do plugin (arquivo local ou Blob), não um asset estático do bundle.
    // eslint-disable-next-line @next/next/no-img-element
    return <img key={current.key} src={`/api/broadcast/stream/${current.itemId}`} alt="" className="h-full w-full object-cover" />;
  }

  if (current.kind === "webpage") {
    return <iframe key={current.key} src={current.url} className="h-full w-full border-0" title="Página web da playlist" />;
  }

  return <NewsCardRotator key={current.key} articles={newsArticles} />;
}

// Título grande + descrição/primeiro parágrafo + imagem menor (banner no topo, não mais fundo
// full-bleed) — pedido direto do usuário depois de ver o layout anterior (imagem full-bleed com
// título pequeno sobreposto). Título/descrição entram com um fade+slide (keyframe
// broadcast-news-title-in, ver output-canvas.tsx) e a imagem tem um Ken Burns sutil (broadcast-
// news-parallax) — key={article.link} no chamador (NewsCardRotator) força remount a cada manchete,
// então as animações re-disparam sozinhas sem nenhum JS de controle aqui. A duração do parallax é
// a mesma do rodízio interno (NEWS_ARTICLE_ROTATION_MS) pra terminar exatamente quando o card sai.
function NewsSlideCard({ article }: { article: RegionNewsArticle }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-black">
      {article.imageUrl && (
        <div className="h-2/5 w-full shrink-0 overflow-hidden">
          {/* imagem vem da API de notícias (domínio arbitrário, resolvido em runtime), incompatível com next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ animation: `broadcast-news-parallax ${NEWS_ARTICLE_ROTATION_MS}ms ease-in-out forwards` }}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center gap-3 overflow-hidden p-6">
        <p
          className="text-4xl leading-tight font-bold"
          style={{ color: "#FFFFFF", animation: "broadcast-news-title-in 600ms ease both" }}
        >
          {article.title}
        </p>
        {article.description && (
          <p
            className="line-clamp-4 text-lg"
            style={{ color: "rgba(255,255,255,0.85)", animation: "broadcast-news-title-in 600ms ease 120ms both" }}
          >
            {article.description}
          </p>
        )}
        {article.sourceName && <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{article.sourceName}</p>}
      </div>
    </div>
  );
}

// Compartilhado pela layer "news" standalone (rodízio contínuo, sem teto) e pelo slide "news"
// dentro da playlist (o teto de tempo do bloco inteiro é responsabilidade de quem monta/desmonta
// este componente — PlaylistLayer via useTimedAdvance — não deste rodízio interno de manchete).
function NewsCardRotator({ articles }: { articles: RegionNewsArticle[] }) {
  const [index, setIndex] = useState(0);
  const current = articles.length > 0 ? articles[index % articles.length] : null;

  useTimedAdvance(NEWS_ARTICLE_ROTATION_MS, () => setIndex((previous) => (previous + 1) % articles.length), articles.length > 1);

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black" style={{ color: "rgba(255,255,255,0.4)" }}>
        Sem notícias no momento
      </div>
    );
  }

  return <NewsSlideCard key={current.link} article={current} />;
}

// Compartilhado por InfoLayer/AgendaLayer. Começa null (não em new Date()) de propósito: SSR e o
// primeiro render client hidratam com "sem hora ainda" idêntico, só o efeito (client-only) enche
// depois — evita mismatch de hidratação por fuso/instante de render diferentes.
function useClock(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}

function InfoLayer({ weather }: { weather: RegionWeather | null }) {
  const now = useClock();

  if (!now) return null;

  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center" style={{ color: "#FFFFFF" }}>
      <span className="text-5xl font-semibold">{time}</span>
      <span className="text-sm capitalize" style={{ color: "rgba(255,255,255,0.8)" }}>{date}</span>
      {weather && (
        <span className="mt-2 text-xl">
          {weather.emoji} {Math.round(weather.temperatureC)}°C — {weather.conditionLabel}
        </span>
      )}
    </div>
  );
}

function NewsLayer({ articles }: { articles: RegionNewsArticle[] }) {
  return <NewsCardRotator articles={articles} />;
}

function formatEventDay(startAt: string | Date): { day: string; month: string; time: string } {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  return {
    day: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isSameDay(startAt: string | Date): boolean {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

const DEFAULT_AGENDA_BACKGROUND = "#0f0f0f";

// Paleta derivada da cor de fundo escolhida pelo operador (agenda.backgroundColor, ver
// agenda-section.tsx) — luminância relativa decide se o texto vai em branco ou quase-preto, pra
// uma cor clara escolhida por engano não virar texto branco ilegível sobre fundo claro.
function resolveAgendaPalette(backgroundColor: string) {
  const clean = backgroundColor.replace("#", "");
  const valid = /^[0-9a-fA-F]{6}$/.test(clean);
  const r = valid ? parseInt(clean.slice(0, 2), 16) : 15;
  const g = valid ? parseInt(clean.slice(2, 4), 16) : 15;
  const b = valid ? parseInt(clean.slice(4, 6), 16) : 15;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const isLight = luminance > 0.6;
  return {
    isLight,
    foreground: isLight ? "#14142b" : "#FFFFFF",
    muted: isLight ? "rgba(20,20,43,0.6)" : "rgba(255,255,255,0.55)",
    subtle: isLight ? "rgba(20,20,43,0.08)" : "rgba(255,255,255,0.1)",
    todayBg: isLight ? "rgba(20,20,43,0.14)" : "rgba(255,255,255,0.12)",
  };
}

// Painel "premium" pedido explicitamente: logo + hora/data no topo, nome da agenda em destaque,
// cards de evento com badge de data, evento de hoje realçado com a cor de destaque, clima no canto
// inferior direito. Rotaciona entre agendas (agendaRotation já vem sem as vazias — ver
// get-output-state) — cada uma fica entry.agenda.displaySeconds na tela antes de trocar, com fundo
// (agenda.backgroundColor, por agenda) e fade suaves, e pontos indicando a posição no rodízio.
function AgendaLayer({
  rotation,
  brandLogoUrl,
  weather,
}: {
  rotation: AgendaRotationEntry[];
  brandLogoUrl: string | null;
  weather: RegionWeather | null;
}) {
  const [index, setIndex] = useState(0);
  const current = rotation.length > 0 ? rotation[index % rotation.length] : null;
  const now = useClock();

  useTimedAdvance(
    current ? current.agenda.displaySeconds * 1000 : 0,
    () => setIndex((previous) => (previous + 1) % rotation.length),
    rotation.length > 1,
  );

  const backgroundColor = current?.agenda.backgroundColor ?? DEFAULT_AGENDA_BACKGROUND;
  const palette = resolveAgendaPalette(backgroundColor);
  const time = now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) ?? "";

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: backgroundColor, transition: "background 500ms ease" }}
    >
      <div className="flex items-center justify-between gap-3 p-4">
        {brandLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário.
          <img
            src={brandLogoUrl}
            alt=""
            className="h-9 w-auto object-contain"
            style={palette.isLight ? undefined : { filter: "brightness(0) invert(1)" }}
          />
        ) : (
          <span />
        )}
        {now && (
          <div className="text-right leading-none">
            <div className="text-lg font-semibold" style={{ color: palette.foreground }}>{time}</div>
            <div className="mt-0.5 text-[11px] capitalize" style={{ color: palette.muted }}>{date}</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-4 pb-4">
        {!current ? (
          <div className="flex h-full items-center justify-center text-center text-sm" style={{ color: palette.muted }}>
            Nenhuma agenda com eventos futuros
          </div>
        ) : (
          <div key={current.agenda.id} className="flex h-full flex-col gap-3" style={{ animation: "broadcast-agenda-fade 500ms ease" }}>
            <span className="text-xs font-semibold uppercase" style={{ color: palette.muted, letterSpacing: "0.08em" }}>
              {current.agenda.name}
            </span>
            <div className="flex flex-1 flex-col gap-2 overflow-hidden">
              {current.events.map((event) => {
                const { day, month, time: eventTime } = formatEventDay(event.startAt);
                const today = isSameDay(event.startAt);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-lg p-2.5"
                    style={{ background: today ? palette.todayBg : palette.subtle }}
                  >
                    <div
                      className="flex shrink-0 flex-col items-center justify-center rounded-md px-2 py-1"
                      style={{
                        background: today ? "#F4B000" : palette.subtle,
                        color: today ? "#0F0F0F" : palette.foreground,
                        minWidth: "2.75rem",
                      }}
                    >
                      <span className="text-base font-bold leading-none">{day}</span>
                      <span className="text-[10px] uppercase leading-none">{month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: palette.foreground }}>{event.title}</p>
                      <p className="text-xs" style={{ color: palette.muted }}>{eventTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {rotation.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-3">
          {rotation.map((entry, entryIndex) => (
            <span
              key={entry.agenda.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: entryIndex === index % rotation.length ? "#F4B000" : palette.subtle }}
            />
          ))}
        </div>
      )}

      {weather && (
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
          style={{ background: palette.subtle, color: palette.foreground }}
        >
          <span className="text-base">{weather.emoji}</span>
          {Math.round(weather.temperatureC)}°C
        </div>
      )}
    </div>
  );
}

// "Aviso rápido" — invisível quando não há mensagem ativa; quando há, sempre uma faixa no rodapé
// com o maior z-index da tela, ignorando completamente a geometria configurada da layer (pedido
// explícito: "quando não houver não aparece, quando houver sobrepõe tudo").
function AlertBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 flex items-center gap-3 px-6 py-4"
      style={{
        zIndex: ALERT_Z_INDEX,
        background: "linear-gradient(90deg, #B3261E, #E8482C)",
        color: "#FFFFFF",
        animation: "broadcast-alert-slide-up 400ms ease",
      }}
    >
      <span className="text-2xl">⚠️</span>
      <span className="text-xl font-semibold">{message}</span>
    </div>
  );
}

export function LayerRenderer({
  layer,
  drawerOpen,
  playlistItemsByPlaylistId,
  resolvedAssetUrlByLayerId,
  regionWeather,
  regionNews,
  agendaRotation,
  activeAlertMessage,
  brandLogoUrl,
}: {
  layer: BroadcastLayerRecord;
  drawerOpen: boolean;
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>;
  resolvedAssetUrlByLayerId: Record<string, string>;
  regionWeather: RegionWeather | null;
  regionNews: RegionNewsArticle[];
  agendaRotation: AgendaRotationEntry[];
  activeAlertMessage: string | null;
  brandLogoUrl: string | null;
}) {
  if (!layer.visible) return null;

  // "alert" nunca passa pelo wrapper de geometria normal — sempre fixed/full-width/z-index máximo,
  // e null quando não há aviso (nem um <div> vazio).
  if (layer.type === "alert") {
    return <AlertBanner message={activeAlertMessage} />;
  }

  const geometry = resolveLayerGeometry(layer, readGeometry(layer.config), drawerOpen);

  return (
    <div
      className="absolute overflow-hidden"
      style={{
        left: `${geometry.x}%`,
        top: `${geometry.y}%`,
        width: `${geometry.width}%`,
        height: `${geometry.height}%`,
        zIndex: layer.zIndex,
        transition: GEOMETRY_TRANSITION,
      }}
    >
      {renderLayerContent(layer, playlistItemsByPlaylistId, resolvedAssetUrlByLayerId, regionWeather, regionNews, agendaRotation, brandLogoUrl)}
    </div>
  );
}

function renderLayerContent(
  layer: BroadcastLayerRecord,
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>,
  resolvedAssetUrlByLayerId: Record<string, string>,
  regionWeather: RegionWeather | null,
  regionNews: RegionNewsArticle[],
  agendaRotation: AgendaRotationEntry[],
  brandLogoUrl: string | null,
) {
  switch (layer.type) {
    case "video": {
      const playlistId = readString(layer.config, "playlistId");
      const items = playlistId ? (playlistItemsByPlaylistId[playlistId] ?? []) : [];
      // key={playlistId} força remount (e index volta a 0) quando a playlist da layer muda —
      // mais simples e mais barato que um useEffect resetando estado (react-hooks/set-state-in-effect).
      // newsArticles sempre vai — só é usado de fato se a playlist tiver um item "news" no meio.
      return <PlaylistLayer key={playlistId ?? layer.id} items={items} newsArticles={regionNews} />;
    }
    case "image": {
      const url = resolvedAssetUrlByLayerId[layer.id];
      if (!url) return null;
      // fonte é a URL do Blob resolvida em runtime (config.mediaAssetId), não um asset estático
      // do bundle — next/image exige domínio conhecido em build, incompatível com storage plugável.
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt="" className="h-full w-full object-cover" />;
    }
    case "text": {
      const text = readString(layer.config, "text") ?? "";
      const color = readString(layer.config, "color") ?? "#FFFFFF";
      return (
        <div className="flex h-full w-full items-center justify-center p-2 text-center" style={{ color }}>
          {text}
        </div>
      );
    }
    case "info":
      return <InfoLayer weather={regionWeather} />;
    case "news":
      return <NewsLayer articles={regionNews} />;
    case "agenda":
      return <AgendaLayer rotation={agendaRotation} brandLogoUrl={brandLogoUrl} weather={regionWeather} />;
    default:
      return null;
  }
}
