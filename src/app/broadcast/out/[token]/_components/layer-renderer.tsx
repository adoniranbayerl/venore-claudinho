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

// config.agendaOpenVariant é a geometria que a camada "video" assume quando drawerOpen=true (a
// coluna de agenda está aberta, então o vídeo encolhe pra abrir espaço) — mesmo mecanismo
// genérico de resolveLayerGeometry que já existia (era "abrir uma gaveta de informações" na Fase
// 5 original), só reaproveitado: agora toda saída nasce com isso auto-configurado (ver
// create-output/store.ts), o operador nunca escreve esse JSON à mão.
function readGeometry(config: Record<string, unknown>): Partial<LayerGeometry> | undefined {
  const value = config.agendaOpenVariant;
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

// Assina um timer que dispara onDone repetidamente a cada durationMs — usado por item de playlist
// "imagem"/"webpage" (duração fixa), pela troca de card de notícia e pelo rodízio de agenda. Nunca
// seta estado síncrono no corpo do efeito (react-hooks/set-state-in-effect): só assina o timer, o
// setState acontece no callback. onDone fica numa ref (não nas deps do efeito) pra não precisar
// remontar o timer a cada render só porque o closure mudou de identidade.
//
// Se reagenda sozinho de dentro do próprio callback do timeout (em vez de um único setTimeout cuja
// dependência é [durationMs, active]) — bug real encontrado: com uma dependência fixa, dois ciclos
// consecutivos com a MESMA duração (ex: duas agendas de 5s, o intervalo fixo de troca de manchete,
// ou até um rodízio de um item só) nunca fazem o efeito reexecutar depois do primeiro avanço,
// porque nem durationMs nem active mudam de valor — o timer dispara uma vez, avança o índice, e
// trava pra sempre no item seguinte (sintoma relatado: "a primeira agenda entra, a segunda não
// alterna mais"). Reagendar de dentro do callback funciona pra qualquer duração/quantidade de
// itens, sem depender de nenhum valor externo mudar entre ciclos.
function useTimedAdvance(durationMs: number, onDone: () => void, active = true) {
  const onDoneRef = useRef(onDone);

  // Ref só é escrita dentro de efeito (nunca durante o render — react-hooks/refs), roda depois de
  // todo render pra manter a ref sempre com o closure mais recente.
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        onDoneRef.current();
        scheduleNext();
      }, durationMs);
    };
    scheduleNext();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
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
  // Bloco de notícias sem nenhuma manchete não tem o que mostrar — sem isso, ele ficava "SEM
  // NOTÍCIAS NO MOMENTO" em texto apagado sobre tela preta pelos 30s inteiros configurados,
  // fácil de confundir com "travou" vendo de longe (achado real relatado numa TV). Some rápido
  // (1s) e segue pro próximo item em vez de ocupar o tempo todo sem nada.
  const isEmptyNewsBlock = current?.kind === "news" && newsArticles.length === 0;

  useTimedAdvance(
    current && current.kind !== "video" ? (isEmptyNewsBlock ? 1000 : current.durationSeconds * 1000) : 0,
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
    // object-contain (não object-cover) — deixa barras pretas (letterbox/pillarbox) quando o
    // vídeo não bate exatamente com a proporção da área disponível, em vez de cortar (pedido
    // explícito: "adicione bordas ao vídeo" em vez de redimensionar a barra de marca embaixo, que
    // era o mecanismo antigo pra "sobrar" a altura certa — ver comentário em BrandFooterBar).
    return (
      <video
        key={current.key}
        className="h-full w-full bg-black object-contain"
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
    return <img key={current.key} src={`/api/broadcast/stream/${current.itemId}`} alt="" className="h-full w-full bg-black object-contain" />;
  }

  if (current.kind === "webpage") {
    return <iframe key={current.key} src={current.url} className="h-full w-full border-0" title="Página web da playlist" />;
  }

  return <NewsCardRotator key={current.key} articles={newsArticles} />;
}

// Camada "video" (playlist principal) — antes ficava travada em 16:9 (padding-top percentual) com
// uma barra de marca ocupando "o que sobrasse" de altura (flex-1). Achado real reportado: em tela
// cheia (F11), a coluna de vídeo fica mais estreita que 16:9 depois de reservar espaço pra agenda,
// então "o que sobra" de altura é muito — a barra inflava desproporcionalmente. A barra de marca
// virou BrandFooterBar, um irmão de altura FIXA no nível do canvas (output-canvas.tsx), não mais
// aninhada aqui — esta função agora só preenche 100% da área que a camada "video" recebe, sem
// impor proporção nenhuma; o vídeo/imagem em si é quem ganha letterbox (object-contain + fundo
// preto, ver PlaylistLayer) quando a proporção não bate, em vez de redimensionar a barra.
function VideoZoneLayer({ items, newsArticles }: { items: PlaylistItemSummary[]; newsArticles: RegionNewsArticle[] }) {
  return (
    <div className="h-full w-full overflow-hidden bg-black">
      <PlaylistLayer items={items} newsArticles={newsArticles} />
    </div>
  );
}

// Barra de marca (logo + relógio + data + temperatura) — altura FIXA (shrink-0, nunca flex-1),
// irmã da região de camadas e do AlertBanner na coluna flex do canvas (output-canvas.tsx), span
// sempre 100% da LARGURA DA TELA (não só da coluna de vídeo) — cobre também a coluna de agenda
// (pedido explícito: "footerbar deve estar acima da agenda também"). Alternável por saída
// (output.footerOpen, mesmo mecanismo de output.drawerOpen pra agenda) — quando fechada, esta
// função nem é montada (ver OutputCanvas), a região de camadas acima recupera 100% da altura.
export function BrandFooterBar({
  brandLogoUrl,
  brandColor,
  weather,
}: {
  brandLogoUrl: string | null;
  brandColor: string;
  weather: RegionWeather | null;
}) {
  const now = useClock();
  const palette = resolveContrastPalette(brandColor);
  const time = now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) ?? "";

  return (
    <div className="flex h-24 w-full shrink-0 items-center justify-between gap-4 px-5" style={{ background: brandColor }}>
      {brandLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário.
        <img
          src={brandLogoUrl}
          alt=""
          className="h-14 w-auto object-contain"
          style={palette.isLight ? undefined : { filter: "brightness(0) invert(1)" }}
        />
      ) : (
        <span />
      )}
      {now && (
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right leading-none">
            <div className="text-2xl font-bold tracking-tight tabular-nums" style={{ color: palette.foreground }}>{time}</div>
            <div className="mt-1 text-xs font-medium capitalize" style={{ color: palette.muted }}>{date}</div>
          </div>
          {weather && (
            <>
              <span aria-hidden="true" className="h-8 w-px shrink-0" style={{ background: palette.subtle }} />
              <div className="flex items-center gap-2">
                <span className="text-3xl leading-none">{weather.emoji}</span>
                <span className="text-2xl leading-none font-bold tabular-nums" style={{ color: palette.foreground }}>
                  {Math.round(weather.temperatureC)}°
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// 2º redesenho — o 1º (fundo desfocado + imagem inteira object-contain) ainda ficava ruim porque
// o problema real não é o corte/esticamento, é que a manchete da NewsData.io vem numa miniatura
// pequena (às vezes ~150-300px) e qualquer tentativa de preencher uma faixa larga do card com ela
// (mesmo "contida") deixa evidente a baixa resolução. A correção é reduzir a imagem a uma miniatura
// pequena e bem emoldurada (moldura fixa ~30% de largura, cantos arredondados, sombra) em vez de
// tentar fazê-la "hero" — um recorte pequeno de uma imagem pequena não chama atenção pro
// pixelamento; o peso visual do card vira tipografia (título/descrição grandes), não a foto.
// Título/descrição entram com fade+slide (broadcast-news-title-in); a imagem tem um zoom lento
// (broadcast-news-parallax) — key={article.link} no chamador (NewsCardRotator) força remount a
// cada manchete, as animações re-disparam sozinhas. onError esconde a imagem se a URL da notícia
// não carregar (em vez do ícone de imagem quebrada do browser).
function NewsSlideCard({ article }: { article: RegionNewsArticle }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;

  return (
    <div className="flex h-full w-full items-center gap-10 overflow-hidden bg-black px-12 py-10">
      {showImage && (
        <div
          className="relative aspect-square w-[30%] shrink-0 overflow-hidden rounded-3xl"
          style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.55)" }}
        >
          {/* imagem vem da API de notícias (domínio arbitrário, resolvido em runtime), incompatível com next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl as string}
            alt=""
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
            style={{ animation: `broadcast-news-parallax ${NEWS_ARTICLE_ROTATION_MS}ms ease-in-out forwards` }}
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {article.sourceName && (
          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ background: "rgba(244,176,0,0.16)", color: "#F4B000" }}
          >
            {article.sourceName}
          </span>
        )}
        <p
          className="text-5xl leading-tight font-bold"
          style={{ color: "#FFFFFF", animation: "broadcast-news-title-in 600ms ease both" }}
        >
          {article.title}
        </p>
        {article.description && (
          <p
            className="line-clamp-5 text-xl"
            style={{ color: "rgba(255,255,255,0.85)", animation: "broadcast-news-title-in 600ms ease 120ms both" }}
          >
            {article.description}
          </p>
        )}
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

// Paleta derivada de uma cor de fundo escolhida pelo operador (agenda.backgroundColor ou
// broadcast.brandColor, ambas hex livres) — luminância relativa decide se o texto vai em branco
// ou quase-preto, pra uma cor clara escolhida por engano não virar texto branco ilegível.
// Compartilhada por AgendaLayer e a barra de marca da camada "video" (MainZoneLayer).
function resolveContrastPalette(backgroundColor: string) {
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

// Painel "premium" pedido explicitamente: logo + nome da agenda em destaque, cards de evento com
// badge de data (+ capa opcional), evento de hoje realçado com a cor de destaque. Rotaciona entre
// agendas (agendaRotation já vem sem as vazias — ver get-output-state) — cada uma fica
// entry.agenda.displaySeconds na tela antes de trocar, com fundo e logo PRÓPRIOS por agenda
// (agenda.backgroundColor/logoUrl — cai no padrão da plataforma/preto quando a agenda não
// configurou os seus) e fade suave, e pontos indicando a posição no rodízio. Relógio/clima
// migraram pra barra inferior da camada "video" (MainZoneLayer) — não aparecem mais aqui.
function AgendaLayer({ rotation, brandLogoUrl }: { rotation: AgendaRotationEntry[]; brandLogoUrl: string | null }) {
  const [index, setIndex] = useState(0);
  const current = rotation.length > 0 ? rotation[index % rotation.length] : null;

  useTimedAdvance(
    current ? current.agenda.displaySeconds * 1000 : 0,
    () => setIndex((previous) => (previous + 1) % rotation.length),
    rotation.length > 1,
  );

  const backgroundColor = current?.agenda.backgroundColor ?? DEFAULT_AGENDA_BACKGROUND;
  const palette = resolveContrastPalette(backgroundColor);
  const logoUrl = current?.logoUrl ?? brandLogoUrl;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: backgroundColor, transition: "background 500ms ease" }}
    >
      {/* Logo/espaçamento aumentados (feedback direto: "tudo está muito apertado. Brand/logo da
          agenda está pequena demais") — mesma altura do logo da BrandFooterBar (h-14), pra ficar
          visível de longe como o resto da tela. */}
      {logoUrl && (
        <div className="flex justify-center p-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário. */}
          <img
            src={logoUrl}
            alt=""
            className="h-14 w-auto object-contain"
            style={palette.isLight ? undefined : { filter: "brightness(0) invert(1)" }}
          />
        </div>
      )}

      <div className="flex-1 overflow-hidden px-5 pb-5">
        {!current ? (
          <div className="flex h-full items-center justify-center text-center text-sm" style={{ color: palette.muted }}>
            Nenhuma agenda com eventos futuros
          </div>
        ) : (
          <div key={current.agenda.id} className="flex h-full flex-col gap-4" style={{ animation: "broadcast-agenda-fade 500ms ease" }}>
            <span className="text-sm font-semibold uppercase" style={{ color: palette.muted, letterSpacing: "0.08em" }}>
              {current.agenda.name}
            </span>
            <div className="flex flex-1 flex-col gap-3 overflow-hidden">
              {current.events.map((event) => {
                const { day, month, time: eventTime } = formatEventDay(event.startAt);
                const today = isSameDay(event.startAt);

                // Com capa: banner grande full-width (dá pra ver de longe, pedido explícito —
                // a primeira versão usava uma miniatura de 40x40, pequena demais) com
                // título/data sobrepostos num gradiente, não mais o card de texto normal.
                if (event.coverUrl) {
                  return (
                    <div key={event.id} className="relative w-full shrink-0 overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 7" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- cover vem de contexts/media (Blob), domínio arbitrário. */}
                      <img src={event.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.15) 55%, transparent)" }}
                      />
                      {today && (
                        <span
                          className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{ background: "#F4B000", color: "#0F0F0F" }}
                        >
                          Hoje
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                        <p className="min-w-0 truncate text-xl font-semibold" style={{ color: "#FFFFFF" }}>{event.title}</p>
                        <div className="shrink-0 text-right leading-none">
                          <span className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>{day}</span>
                          <span className="block text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.75)" }}>{month}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3.5 rounded-lg p-3.5"
                    style={{ background: today ? palette.todayBg : palette.subtle }}
                  >
                    <div
                      className="flex shrink-0 flex-col items-center justify-center rounded-md px-2.5 py-1.5"
                      style={{
                        background: today ? "#F4B000" : palette.subtle,
                        color: today ? "#0F0F0F" : palette.foreground,
                        minWidth: "3.25rem",
                      }}
                    >
                      <span className="text-lg font-bold leading-none">{day}</span>
                      <span className="text-[10px] uppercase leading-none">{month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium" style={{ color: palette.foreground }}>{event.title}</p>
                      <p className="text-sm" style={{ color: palette.muted }}>{eventTime}</p>
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
    </div>
  );
}

// "Aviso rápido" — invisível quando não há mensagem ativa; quando há, uma faixa que EMPURRA o
// resto do layout (irmã de altura natural na coluna flex do canvas, depois da região de camadas e
// do footer — ver OutputCanvas), não mais um overlay `fixed`/z-index máximo. Achado direto do
// usuário: um overlay cobria conteúdo por baixo (ex: parte do vídeo, ou a agenda); em flow normal
// ela só reduz a altura disponível pra região de camadas acima, sem esconder nada.
export function AlertBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      className="flex w-full shrink-0 items-center gap-3 px-6 py-4"
      style={{
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
  brandLogoUrl,
}: {
  layer: BroadcastLayerRecord;
  drawerOpen: boolean;
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>;
  resolvedAssetUrlByLayerId: Record<string, string>;
  regionWeather: RegionWeather | null;
  regionNews: RegionNewsArticle[];
  agendaRotation: AgendaRotationEntry[];
  brandLogoUrl: string | null;
}) {
  if (!layer.visible) return null;

  // "alert" não é mais renderizada aqui — vira AlertBanner, um irmão de altura natural no nível do
  // canvas (OutputCanvas filtra layers.type !== "alert" antes de mapear pra LayerRenderer), pra
  // poder empurrar o layout em vez de sobrepor (ver comentário em AlertBanner acima).
  // drawerOpen agora é "a coluna de agenda está aberta" (renomeado de conceito só na UI/comentários
  // — o campo no banco continua se chamando drawerOpen, ver outputs-section.tsx). Com a coluna
  // fechada, a camada "agenda" simplesmente não renderiza (senão ficaria sobrepondo o vídeo, que
  // nessa hora volta a ocupar 100% de largura via config.agendaOpenVariant, ver readGeometry acima).
  if (layer.type === "agenda" && !drawerOpen) return null;

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
      return <VideoZoneLayer key={playlistId ?? layer.id} items={items} newsArticles={regionNews} />;
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
      return <AgendaLayer rotation={agendaRotation} brandLogoUrl={brandLogoUrl} />;
    default:
      return null;
  }
}
