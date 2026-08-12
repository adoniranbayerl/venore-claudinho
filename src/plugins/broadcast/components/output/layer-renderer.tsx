"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
// Importa direto de contracts/ e shared/, nunca do barrel (@/plugins/broadcast) — este é um "use
// client" component, e o barrel reexporta handlers server-only (Drizzle/pg) que quebram o bundle
// do browser mesmo quando só o tipo é usado aqui (achado real do `next build`, não teórico).
import { resolveLayerGeometry, type LayerGeometry } from "@/plugins/broadcast/shared/layer-geometry";
import {
  BROADCAST_AGENDA_VIEW_SIZE_SCALE,
  type BroadcastAgendaAnimationStyle,
  type BroadcastAgendaViewSize,
} from "@/plugins/broadcast/shared/settings";
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

// Sobrescreve a largura da agenda (e o quanto o vídeo encolhe pra abrir espaço) a partir do
// percentual já resolvido por useZeroBarAgendaWidthPercent (estático ou medido em tempo real),
// ignorando o x/width gravado por saída na criação (create-output/store.ts) — assim um ajuste de
// tamanho vale pra saídas já existentes também, não só pras criadas depois de mudar a
// configuração. Só entra em jogo com a coluna de agenda aberta; fechada, o vídeo já ocupa 100% por
// conta própria, sem precisar de override.
function applyAgendaViewSizeOverride(
  layer: BroadcastLayerRecord,
  geometry: LayerGeometry,
  drawerOpen: boolean,
  agendaWidthPercent: number,
): LayerGeometry {
  if (!drawerOpen || (layer.type !== "agenda" && layer.type !== "video")) return geometry;
  if (layer.type === "agenda") return { ...geometry, x: 100 - agendaWidthPercent, width: agendaWidthPercent };
  return { ...geometry, width: 100 - agendaWidthPercent };
}

// Largura da agenda recalculada a partir da resolução REAL da tela — pedido explícito: "não quero
// espaços pretos" na view do vídeo, com piso de ~1/4 da tela ("a barra da agenda deve ter no
// mínimo aproximadamente 1/4 da tela... para manter a área de view sem faixas pretas"). A caixa do
// vídeo só fecha exatamente 16:9 quando a largura que a agenda tira (em %) bate matematicamente
// com a altura que o footer tira (em %) — a mesma tela perde largura pro lado da agenda e altura
// pro footer, e pra zerar a barra preta os dois precisam se cancelar (agendaWidthPercent =
// footerHeightPx / screenHeight, assumindo tela 16:9). Um valor fixo por tier só acerta numa
// resolução específica; em qualquer outra (4K, ultrawide, TV fora do padrão 1080p) sobra ou falta
// espaço — daí medir a tela de verdade em vez de assumir 1920x1080.
//
// window.screen.width/height (resolução FÍSICA do monitor), não window.innerWidth/innerHeight
// (viewport do browser) — innerHeight muda quando a barra de endereço/abas some/aparece (ex:
// apertar F11), fazendo a conta oscilar mesmo sem a tela física mudar. Achado real: "quando aperto
// F11 a agenda não deve diminuir" — innerHeight crescendo ao esconder o chrome do browser mudava o
// resultado da conta a cada toggle de fullscreen. screen.width/height é o mesmo valor com ou sem
// F11 (é o monitor, não a janela), então o cálculo fica estável — e numa TV/kiosk real (sem chrome
// de browser pra esconder) o comportamento já era assim de qualquer forma.
//
// Clampada entre o piso de 25% (agenda nunca fica menor que isso, mesmo que a conta desse um valor
// menor) e o teto configurado no tier (agendaWidthPercent de BROADCAST_AGENDA_VIEW_SIZE_SCALE — a
// agenda nunca fica MAIS larga que o admin pediu). O piso tem prioridade sobre o teto (Math.max
// aplicado por último) — se algum tier tiver agendaWidthPercent < 25 (não deveria, ver
// BROADCAST_AGENDA_VIEW_SIZE_SCALE), o piso ainda garante o mínimo pedido. Com o footer FECHADO
// (footerHeightPx efetivo = 0) a conta tende a 0%, então o piso passa a ser quem define a largura.
//
// SSR-safe (começa no valor estático do tier, igual ao que o server já mandou pronto — mesmo
// racional de useClock) e evita o padrão que react-hooks/set-state-in-effect sinaliza: a primeira
// medição roda num setTimeout(0) em vez de síncrona no corpo do efeito (mesma técnica de
// TimedProgressFill/VideoProgressFill acima — setState só de dentro de um callback assíncrono,
// nunca como a primeira linha do efeito).
function useZeroBarAgendaWidthPercent(agendaViewSize: BroadcastAgendaViewSize, footerOpen: boolean, active: boolean): number {
  const staticPercent = BROADCAST_AGENDA_VIEW_SIZE_SCALE[agendaViewSize].agendaWidthPercent;
  const [percent, setPercent] = useState(staticPercent);
  const MIN_AGENDA_WIDTH_PERCENT = 30;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const recompute = () => {
      if (cancelled) return;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const footerHeightPx = footerOpen ? BROADCAST_AGENDA_VIEW_SIZE_SCALE[agendaViewSize].footerHeightPx : 0;
      const videoZoneHeightPx = screenHeight - footerHeightPx;
      const zeroBarVideoWidthPx = videoZoneHeightPx * (16 / 9);
      const computedPercent = ((screenWidth - zeroBarVideoWidthPx) / screenWidth) * 100;
      setPercent(Math.max(MIN_AGENDA_WIDTH_PERCENT, Math.min(staticPercent, computedPercent)));
    };
    const timeoutId = setTimeout(recompute, 0);
    window.addEventListener("resize", recompute);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("resize", recompute);
    };
  }, [agendaViewSize, footerOpen, active, staticPercent]);

  return percent;
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
//
// resetKey é opcional — usado pelo avanço manual por clique (pedido explícito: "se clicar na view
// muda o vídeo, se clicar na agenda muda a agenda"): incrementar o contador reinicia a contagem
// automática do zero a partir do clique, em vez de deixar o timer automático (que continuaria
// contando desde o ciclo anterior) disparar de novo logo em seguida e "engolir" um item.
function useTimedAdvance(durationMs: number, onDone: () => void, active = true, resetKey: number = 0) {
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
  }, [durationMs, active, resetKey]);
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

// Progresso do item atual (0-100), pra barra de progresso (ver PlaylistLayer) — vídeo usa
// timeupdate/loadedmetadata reais do <video> (currentTime/duration), os demais tipos (imagem/
// webpage/notícia) usam a mesma duração fixa que useTimedAdvance já lê pra decidir quando avançar,
// só que aqui tickando visualmente (~8x/s) em vez de só disparar uma vez no fim. Pedido explícito:
// "use a barra de progress do shadcn para indicar o tempo de execução daquele elemento. Seja
// vídeo, seja página, etc.".
//
// Reset ao trocar de slide/clique manual é feito por REMOUNT (key na chamada em PlaylistLayer),
// não por um setPercent(0) síncrono no corpo do efeito — cada componente já nasce com percent=0,
// que é o próprio valor inicial de useState. Evita o padrão que react-hooks/set-state-in-effect
// sinaliza (setState síncrono logo na entrada do efeito, disparando um render em cascata extra).
function TimedProgressFill({ durationMs }: { durationMs: number }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (durationMs <= 0) return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setPercent(Math.min(100, ((Date.now() - startedAt) / durationMs) * 100));
    }, 125);
    return () => clearInterval(interval);
  }, [durationMs]);

  return <ProgressOverlay percent={percent} />;
}

function VideoProgressFill({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const update = () => {
      if (element.duration > 0) setPercent(Math.min(100, (element.currentTime / element.duration) * 100));
    };
    element.addEventListener("timeupdate", update);
    return () => element.removeEventListener("timeupdate", update);
  }, [videoRef]);

  return <ProgressOverlay percent={percent} />;
}

// Overlay fino, LARGURA CHEIA e rente à borda inferior do slide (sem padding/cantos arredondados —
// pedido explícito: "full width, sobreposta ao vídeo e não ocupando espaço do height"). Cores
// discretas de propósito (trilho quase invisível, indicador com opacidade reduzida) — a primeira
// versão usava TV_ACCENT_COLOR sólido e ficou "muito chamativa" (feedback direto). Trilho e cor do
// indicador vêm por style inline, nunca className, mesma convenção do resto deste arquivo
// (globals/no-restricted-syntax só permite cor crua fora de className).
function ProgressOverlay({ percent }: { percent: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0">
      <Progress
        value={percent}
        className="h-0.5 rounded-none *:data-[slot=progress-indicator]:rounded-none *:data-[slot=progress-indicator]:bg-(--tv-progress-color)"
        style={{ background: "rgba(255,255,255,0.12)", "--tv-progress-color": "rgba(244,176,0,0.6)" } as React.CSSProperties}
      />
    </div>
  );
}

function PlaylistLayer({ items, newsArticles }: { items: PlaylistItemSummary[]; newsArticles: RegionNewsArticle[] }) {
  const [index, setIndex] = useState(0);
  // Incrementado a cada avanço manual por clique — vira resetKey de useTimedAdvance, reiniciando a
  // contagem automática a partir do clique (ver comentário na definição do hook).
  const [manualTick, setManualTick] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const slides = buildPlaylistSlides(items);

  const advance = () => setIndex((previous) => (previous + 1) % slides.length);
  const current = slides.length > 0 ? slides[index % slides.length] : null;
  // Bloco de notícias sem nenhuma manchete não tem o que mostrar — sem isso, ele ficava "SEM
  // NOTÍCIAS NO MOMENTO" em texto apagado sobre tela preta pelos 30s inteiros configurados,
  // fácil de confundir com "travou" vendo de longe (achado real relatado numa TV). Some rápido
  // (1s) e segue pro próximo item em vez de ocupar o tempo todo sem nada.
  const isEmptyNewsBlock = current?.kind === "news" && newsArticles.length === 0;
  const timedDurationMs = current && current.kind !== "video" ? (isEmptyNewsBlock ? 1000 : current.durationSeconds * 1000) : 0;
  const timedActive = current !== null && current.kind !== "video";

  useTimedAdvance(timedDurationMs, advance, timedActive, manualTick);

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Sem playlist configurada
      </div>
    );
  }

  // object-contain (letterbox/pillarbox com barras pretas) — object-cover (preenche o quadro,
  // cortando o excesso) tinha sido escolhido antes a pedido, mas parou de funcionar depois que a
  // coluna de agenda ficou mais larga (BROADCAST_AGENDA_VIEW_SIZE_SCALE): a caixa do vídeo deixou
  // de ficar perto de 16:9 e o corte passou de "borda discreta" pra "perde 40%+ do quadro,
  // cortando pro lado" — achado real: "a view do vídeo precisa permanecer 16:9, o vídeo está
  // cortando para a esquerda". O canvas inteiro já é preto (bg-black aqui e no canvas raiz), então
  // a barra do letterbox não aparece como uma "borda" isolada — se funde no fundo.
  const content =
    current.kind === "video" ? (
      <video
        key={current.key}
        ref={videoRef}
        className="h-full w-full object-contain"
        src={`/api/broadcast/stream/${current.itemId}`}
        autoPlay
        muted
        playsInline
        onEnded={advance}
      />
    ) : current.kind === "image" ? (
      // fonte é a rota de stream do plugin (arquivo local ou Blob), não um asset estático do bundle.
      // eslint-disable-next-line @next/next/no-img-element
      <img key={current.key} src={`/api/broadcast/stream/${current.itemId}`} alt="" className="h-full w-full object-contain" />
    ) : current.kind === "webpage" ? (
      <iframe key={current.key} src={current.url} className="h-full w-full border-0" title="Página web da playlist" />
    ) : (
      <NewsCardRotator key={current.key} articles={newsArticles} />
    );

  // Clicável quando há mais de um item — pedido explícito: "se clicar na view muda o vídeo". Uma
  // camada transparente por cima (não onClick direto no <video>/<iframe>) garante o mesmo
  // comportamento pra qualquer tipo de slide, inclusive "webpage" (um clique dentro de um <iframe>
  // nunca borbulha pro elemento pai — é outro documento).
  return (
    <div className="relative h-full w-full">
      {content}
      {slides.length > 1 && (
        <div
          role="button"
          aria-label="Avançar para o próximo item da playlist"
          onClick={() => {
            advance();
            setManualTick((tick) => tick + 1);
          }}
          className="absolute inset-0 cursor-pointer"
        />
      )}
      {/* Barra de progresso (shadcn Progress) indicando quanto falta pro item atual da playlist
          avançar — vídeo usa o tempo real de reprodução, os outros tipos (imagem/webpage/notícia)
          usam a duração configurada. key força remount (e reset de percent pra 0) a cada troca de
          slide ou clique manual (manualTick) — ver comentário em TimedProgressFill acima. */}
      {current.kind === "video" ? (
        // Sufixo "-progress" evita colidir com a key de `content` acima (mesmo current.key, mesmo
        // pai) — duas keys iguais entre irmãos faziam o React reportar "two children with the same
        // key" e arriscar duplicar/omitir um dos dois.
        <VideoProgressFill key={`${current.key}-progress`} videoRef={videoRef} />
      ) : (
        <TimedProgressFill key={`${current.key}-${manualTick}-progress`} durationMs={timedDurationMs} />
      )}
    </div>
  );
}

// Camada "video" (playlist principal) — o footer (BrandFooterBar) mora AQUI DENTRO agora, não mais
// como irmão de largura de tela cheia no canvas (output-canvas.tsx) — pedido explícito: "o Footer
// fica APENAS na parte da view do Vídeo, a Agenda vai do canto superior até o inferior". Empilhado
// em flex-col: playlist (flex-1) + footer (altura fixa do tier, shrink-0) — a agenda (AgendaLayer,
// caixa totalmente separada na geometria de LayerRenderer) nunca é afetada pela altura do footer.
function VideoZoneLayer({
  items,
  newsArticles,
  footerOpen,
  brandLogoUrl,
  brandColor,
  weather,
  agendaViewSize,
}: {
  items: PlaylistItemSummary[];
  newsArticles: RegionNewsArticle[];
  footerOpen: boolean;
  brandLogoUrl: string | null;
  brandColor: string;
  weather: RegionWeather | null;
  agendaViewSize: BroadcastAgendaViewSize;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: brandColor }}>
      <div className="min-h-0 flex-1 overflow-hidden">
        <PlaylistLayer items={items} newsArticles={newsArticles} />
      </div>
      {footerOpen && (
        <BrandFooterBar brandLogoUrl={brandLogoUrl} brandColor={brandColor} weather={weather} agendaViewSize={agendaViewSize} />
      )}
    </div>
  );
}

// Barra de marca (logo + relógio + data + temperatura) — altura FIXA do tier (shrink-0, nunca
// flex-1), agora aninhada DENTRO da coluna de vídeo (ver VideoZoneLayer acima), não mais um irmão
// de largura de tela cheia — pedido explícito: "o Footer fica APENAS na parte da view do Vídeo".
// Tamanho de volta ao valor base por tier (sem crescimento dinâmico pra "caçar" 16:9 — chegava a
// ocupar ~30% da tela numa agenda larga; pedido explícito: "o footer pode ser menor, no tamanho
// que estava antes"). Alternável por saída (output.footerOpen) — quando fechada, esta função nem é
// montada (ver VideoZoneLayer), a playlist recupera 100% da altura da coluna de vídeo.
export function BrandFooterBar({
  brandLogoUrl,
  brandColor,
  weather,
  agendaViewSize,
}: {
  brandLogoUrl: string | null;
  brandColor: string;
  weather: RegionWeather | null;
  agendaViewSize: BroadcastAgendaViewSize;
}) {
  const now = useClock();
  const palette = resolveContrastPalette(brandColor);
  const time = now?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) ?? "";
  const { footerHeightClassName, footerLogoHeightClassName } = BROADCAST_AGENDA_VIEW_SIZE_SCALE[agendaViewSize];

  return (
    <div
      className={`flex ${footerHeightClassName} w-full shrink-0 items-center justify-between gap-4 px-7`}
      style={{ background: brandColor }}
    >
      {brandLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário.
        <img
          src={brandLogoUrl}
          alt=""
          className={`${footerLogoHeightClassName} w-auto object-contain`}
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
            // UX "premium" — mesmo par tipográfico do horário ao lado (número grande em cima,
            // rótulo pequeno e discreto embaixo) em vez de só emoji+número soltos, pra ficar
            // visualmente consistente com o resto da barra.
            <>
              <span aria-hidden="true" className="h-8 w-px shrink-0" style={{ background: palette.subtle }} />
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">{weather.emoji}</span>
                <div className="text-left leading-none">
                  <div className="text-2xl font-bold tabular-nums" style={{ color: palette.foreground }}>
                    {Math.round(weather.temperatureC)}°
                  </div>
                  <div className="mt-1 text-xs font-medium capitalize" style={{ color: palette.muted }}>{weather.conditionLabel}</div>
                </div>
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
            style={{ background: TV_ACCENT_COLOR_SOFT, color: TV_ACCENT_COLOR }}
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

// weekday entra pro card de evento — pedido explícito: "existem eventos que são recorrentes toda
// semana, vale colocar o dia da semana na view, não apenas a data numérica" (pra "toda quinta"
// ficar óbvio de bater o olho, sem precisar calcular o dia da semana a partir do número).
function formatEventDay(startAt: string | Date): { day: string; month: string; weekday: string; time: string } {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  return {
    day: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
    month: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    weekday: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isSameDay(startAt: string | Date): boolean {
  const date = typeof startAt === "string" ? new Date(startAt) : startAt;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

const DEFAULT_AGENDA_BACKGROUND = "#0f0f0f";

// Cor de destaque fixa da view (badge "hoje", fonte de notícia, ponto ativo do rodízio) —
// independente do tema shadcn do admin de propósito, mesmo racional já documentado acima pra
// branco/preto/scrim (overlay fixo sobre vídeo/foto, não deve variar com o tema do admin). Antes
// repetida como literal em 5 lugares — centralizada aqui só pra não copiar o valor cru de novo a
// cada uso (pedido: "falta... uso do sistema de primary, secondary, accent, etc" — aqui não dá
// pra usar token shadcn de verdade pelo motivo já documentado, mas dá pra parar de repetir).
const TV_ACCENT_COLOR = "#F4B000";
const TV_ACCENT_COLOR_SOFT = "rgba(244,176,0,0.16)";
const TV_ACCENT_FOREGROUND = "#0F0F0F";

// Gradiente do AlertBanner (vermelho/laranja de aviso) — mesmo racional de TV_ACCENT_COLOR acima.
const TV_ALERT_GRADIENT = "linear-gradient(90deg, #B3261E, #E8482C)";

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
function AgendaLayer({
  rotation,
  brandLogoUrl,
  animationStyle,
}: {
  rotation: AgendaRotationEntry[];
  brandLogoUrl: string | null;
  animationStyle: BroadcastAgendaAnimationStyle;
}) {
  const [index, setIndex] = useState(0);
  // Mesmo mecanismo de PlaylistLayer — reinicia a contagem automática a partir de um clique manual.
  const [manualTick, setManualTick] = useState(0);
  const current = rotation.length > 0 ? rotation[index % rotation.length] : null;
  const advanceAgenda = () => setIndex((previous) => (previous + 1) % rotation.length);

  useTimedAdvance(current ? current.agenda.displaySeconds * 1000 : 0, advanceAgenda, rotation.length > 1, manualTick);

  // LayerRenderer só monta esta layer quando drawerOpen=true, e drawerOpen agora já exige
  // rotation.length > 0 (ver effectiveDrawerOpen em output-canvas.tsx — "se não houver agenda
  // ativa, feche a agenda no View") — current nunca é null na prática, mas o guard evita depender
  // dessa garantia implícita entre arquivos.
  if (!current) return null;

  const backgroundColor = current.agenda.backgroundColor ?? DEFAULT_AGENDA_BACKGROUND;
  const palette = resolveContrastPalette(backgroundColor);
  const logoUrl = current.logoUrl ?? brandLogoUrl;

  // Clicável quando há mais de uma agenda no rodízio — pedido explícito: "se clicar na Agenda,
  // muda a agenda". onClick direto no container (diferente de PlaylistLayer): aqui não existe
  // sub-elemento tipo <iframe> que engoliria o clique, então não precisa de uma camada extra por
  // cima.
  return (
    <div
      role={rotation.length > 1 ? "button" : undefined}
      aria-label={rotation.length > 1 ? "Avançar para a próxima agenda" : undefined}
      onClick={
        rotation.length > 1
          ? () => {
              advanceAgenda();
              setManualTick((tick) => tick + 1);
            }
          : undefined
      }
      className={`relative flex h-full w-full flex-col overflow-hidden ${rotation.length > 1 ? "cursor-pointer" : ""}`}
      style={{ background: backgroundColor, transition: "background 500ms ease" }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-7 pt-7">
        {/* "fade": o bloco inteiro (nome + eventos) surge junto, como sempre foi. "cascade": o
            bloco em si não anima — cada card de evento abaixo anima por conta própria, em
            sequência (animation-delay crescente por índice), então NÃO dá pra por animação aqui
            também (dobraria a animação: o bloco inteiro deslizando E os itens em cascata dentro
            dele ao mesmo tempo). Pedido explícito: "opção no sistema de colocar o fade atual ou
            essa [cascata]". */}
        <div
          key={current.agenda.id}
          className="flex h-full min-h-0 flex-col gap-4"
          style={animationStyle === "fade" ? { animation: "broadcast-agenda-fade 500ms ease" } : undefined}
        >
          {/* Redesenho "moderno e premium" (pedido explícito) — o text-4xl solto anterior ficou
              grande demais/pesado; troca por um kicker discreto ("AGENDA") em caixa alta com
              tracking largo na cor de destaque + barra de acento vertical, ancorando um título
              menor e mais elegante ao lado. Mesmo par tipográfico (rótulo pequeno em cima/ao lado,
              elemento grande em destaque) já usado no relógio/clima da BrandFooterBar, pra manter
              consistência visual entre as duas peças de marca do canvas. */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[11px] font-bold uppercase"
              style={{ color: TV_ACCENT_COLOR, letterSpacing: "0.32em" }}
            >
              Agenda
            </span>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-7 w-1 shrink-0 rounded-full" style={{ background: TV_ACCENT_COLOR }} />
              <span
                className="truncate text-2xl leading-tight font-bold uppercase"
                style={{ color: palette.foreground, letterSpacing: "0.01em" }}
              >
                {current.agenda.name}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
            {current.events.map((event, eventIndex) => {
              const { day, month, weekday, time: eventTime } = formatEventDay(event.startAt);
              const today = isSameDay(event.startAt);
              // "seg • 14:00" — pedido explícito: eventos recorrentes toda semana ficam óbvios de
              // bater o olho ("toda seg") sem precisar calcular a partir do número do dia. Com
              // horário de término opcional, vira "seg • 14:00–15:30".
              const weekdayAndTime = `${weekday} • ${eventTime}${event.endTime ? `–${event.endTime.slice(0, 5)}` : ""}`;
              // 120ms entre cada card (mais espaçado que a primeira versão, pedido explícito: "mais
              // expressiva") — devagar o bastante pra cada entrada da direita ser individualmente
              // percebida, não só um blur de movimento.
              const cascadeStyle: React.CSSProperties | undefined =
                animationStyle === "cascade"
                  ? {
                      animation: "broadcast-agenda-cascade-item 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
                      animationDelay: `${eventIndex * 120}ms`,
                    }
                  : undefined;

              // Com capa: banner full-width com título/data sobrepostos num gradiente. Altura FIXA
              // (h-28), não mais aspectRatio (pedido explícito: "os itens da agenda devem ter um
              // height menor, para caber pelo menos umas 7 entradas com as imagens") — com
              // aspectRatio, uma coluna de agenda mais larga (BROADCAST_AGENDA_VIEW_SIZE_SCALE)
              // deixava CADA card proporcionalmente mais alto, brigando direto com "caber mais
              // itens"; altura fixa desacopla as duas coisas. Mantém a informação de data/hora que
              // o card sem capa tem — dia da semana + horário abaixo do título, não só dia/mês no
              // badge.
              if (event.coverUrl) {
                return (
                  <div
                    key={event.id}
                    className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg"
                    style={cascadeStyle}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- cover vem de contexts/media (Blob), domínio arbitrário. */}
                    <img src={event.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    {/* Gradiente mais forte e mais alto (chegava só a 55% da altura, deixando o título
                        raso em foto clara) + text-shadow no texto solto (título/dia da semana) — pedido
                        explícito: "existe pouca legibilidade" numa foto de fundo arbitrária. */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.35) 70%, transparent)" }}
                    />
                    {today && (
                      <span
                        className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold uppercase"
                        style={{ background: TV_ACCENT_COLOR, color: TV_ACCENT_FOREGROUND }}
                      >
                        Hoje
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p
                          className="truncate text-xl font-semibold"
                          style={{ color: "#FFFFFF", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                        >
                          {event.title}
                        </p>
                        {/* Badge com ícone de relógio (não mais texto solto) — mesmo racional do
                            card sem capa: pedido explícito "crie recursos para evidenciar melhor
                            a data, dia da semana e hora". */}
                        <span
                          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-sm font-semibold capitalize"
                          style={{ background: "rgba(255,255,255,0.18)", color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
                        >
                          <Clock className="size-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{weekdayAndTime}</span>
                        </span>
                      </div>
                      {/* Data em badge sólido (não texto solto sobre o gradiente) — garante
                          contraste igual ao do card sem capa, independente do que estiver por
                          trás na foto. */}
                      <div
                        className="flex shrink-0 flex-col items-center justify-center rounded-md px-3 py-2 text-center leading-none"
                        style={{ background: today ? TV_ACCENT_COLOR : "rgba(0,0,0,0.55)", color: today ? TV_ACCENT_FOREGROUND : "#FFFFFF" }}
                      >
                        <span className="text-3xl font-bold">{day}</span>
                        <span className="mt-0.5 text-xs font-semibold uppercase" style={{ opacity: 0.85 }}>
                          {month}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Sem capa: card compacto (pedido: "os itens da agenda devem ter um height menor,
              // para caber... umas 12 sem imagens"), mas com texto maior que a primeira versão
              // compacta (pedido: "aumente o texto dos cards de eventos") — o que sobrou pra
              // encolher foi o padding/gap ao redor, não mais o texto em si. Dia da semana + hora
              // ganharam um badge próprio com ícone de relógio, mesmo tratamento visual da fonte
              // de notícia (TV_ACCENT_COLOR/TV_ACCENT_COLOR_SOFT) — pedido explícito: "crie
              // recursos para evidenciar melhor a data, dia da semana e hora".
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3.5 rounded-lg p-3"
                  style={{ background: today ? palette.todayBg : palette.subtle, ...cascadeStyle }}
                >
                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-md px-3 py-2"
                    style={{
                      background: today ? TV_ACCENT_COLOR : palette.subtle,
                      color: today ? TV_ACCENT_FOREGROUND : palette.foreground,
                      minWidth: "4.75rem",
                    }}
                  >
                    <span className="text-3xl font-bold leading-none">{day}</span>
                    <span className="mt-0.5 text-sm font-semibold uppercase leading-none" style={{ opacity: 0.85 }}>
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-medium" style={{ color: palette.foreground }}>{event.title}</p>
                    <span
                      className="mt-1.5 inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-2.5 py-1 text-sm font-semibold capitalize"
                      style={{ background: TV_ACCENT_COLOR_SOFT, color: TV_ACCENT_COLOR }}
                    >
                      <Clock className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{weekdayAndTime}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brand descido pro canto inferior direito (pedido explícito: "Desça o Brand da Agenda
          para a parte inferior direita") — item de flex normal (shrink-0), não posicionamento
          absoluto, então reserva a própria altura na coluna: a lista de eventos acima (flex-1
          min-h-0 overflow-hidden) nunca desenha por baixo dele (pedido explícito: "Não permita
          que tenha eventos até o Brand"). Menor que antes (h-16 em vez de h-20) — deixou de ser o
          elemento principal da coluna, esse papel agora é do título. */}
      {logoUrl && (
        <div className="flex shrink-0 justify-end px-7 pb-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo vem de contexts/media (Blob), domínio arbitrário. */}
          <img
            src={logoUrl}
            alt=""
            className="h-16 max-w-48 w-auto object-contain"
            style={palette.isLight ? undefined : { filter: "brightness(0) invert(1)" }}
          />
        </div>
      )}

      {rotation.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-3">
          {rotation.map((entry, entryIndex) => (
            <span
              key={entry.agenda.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: entryIndex === index % rotation.length ? TV_ACCENT_COLOR : palette.subtle }}
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
      className="flex w-full shrink-0 items-center gap-3 px-7 py-5"
      style={{
        background: TV_ALERT_GRADIENT,
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
  brandColor,
  agendaAnimationStyle,
  agendaViewSize,
  footerOpen,
}: {
  layer: BroadcastLayerRecord;
  drawerOpen: boolean;
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>;
  resolvedAssetUrlByLayerId: Record<string, string>;
  regionWeather: RegionWeather | null;
  regionNews: RegionNewsArticle[];
  agendaRotation: AgendaRotationEntry[];
  brandLogoUrl: string | null;
  brandColor: string;
  agendaAnimationStyle: BroadcastAgendaAnimationStyle;
  agendaViewSize: BroadcastAgendaViewSize;
  // BrandFooterBar agora mora dentro da camada "video" (ver VideoZoneLayer) — precisa saber se
  // deve montar, mesmo mecanismo de output.drawerOpen pra agenda.
  footerOpen: boolean;
}) {
  // Hook sempre chamado, antes de qualquer return condicional (regra de hooks) — só faz trabalho
  // de verdade (listener de resize) quando a camada é agenda/vídeo E a gaveta está aberta; nos
  // demais casos devolve o estático na hora, sem tocar em window.
  const needsAgendaWidthMeasurement = drawerOpen && (layer.type === "agenda" || layer.type === "video");
  const agendaWidthPercent = useZeroBarAgendaWidthPercent(agendaViewSize, footerOpen, needsAgendaWidthMeasurement);

  if (!layer.visible) return null;

  // "alert" não é mais renderizada aqui — vira AlertBanner, um irmão de altura natural no nível do
  // canvas (OutputCanvas filtra layers.type !== "alert" antes de mapear pra LayerRenderer), pra
  // poder empurrar o layout em vez de sobrepor (ver comentário em AlertBanner acima).
  // drawerOpen agora é "a coluna de agenda está aberta" (renomeado de conceito só na UI/comentários
  // — o campo no banco continua se chamando drawerOpen, ver outputs-section.tsx). Com a coluna
  // fechada, a camada "agenda" simplesmente não renderiza (senão ficaria sobrepondo o vídeo, que
  // nessa hora volta a ocupar 100% de largura via config.agendaOpenVariant, ver readGeometry acima).
  if (layer.type === "agenda" && !drawerOpen) return null;

  const geometry = applyAgendaViewSizeOverride(
    layer,
    resolveLayerGeometry(layer, readGeometry(layer.config), drawerOpen),
    drawerOpen,
    agendaWidthPercent,
  );

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
      {renderLayerContent(
        layer,
        playlistItemsByPlaylistId,
        resolvedAssetUrlByLayerId,
        regionWeather,
        regionNews,
        agendaRotation,
        brandLogoUrl,
        brandColor,
        agendaAnimationStyle,
        agendaViewSize,
        footerOpen,
      )}
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
  brandColor: string,
  agendaAnimationStyle: BroadcastAgendaAnimationStyle,
  agendaViewSize: BroadcastAgendaViewSize,
  footerOpen: boolean,
) {
  switch (layer.type) {
    case "video": {
      const playlistId = readString(layer.config, "playlistId");
      const items = playlistId ? (playlistItemsByPlaylistId[playlistId] ?? []) : [];
      // key={playlistId} força remount (e index volta a 0) quando a playlist da layer muda —
      // mais simples e mais barato que um useEffect resetando estado (react-hooks/set-state-in-effect).
      // newsArticles sempre vai — só é usado de fato se a playlist tiver um item "news" no meio.
      return (
        <VideoZoneLayer
          key={playlistId ?? layer.id}
          items={items}
          newsArticles={regionNews}
          footerOpen={footerOpen}
          brandLogoUrl={brandLogoUrl}
          brandColor={brandColor}
          weather={regionWeather}
          agendaViewSize={agendaViewSize}
        />
      );
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
      return <AgendaLayer rotation={agendaRotation} brandLogoUrl={brandLogoUrl} animationStyle={agendaAnimationStyle} />;
    default:
      return null;
  }
}
