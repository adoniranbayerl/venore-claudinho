import path from "node:path";
import { getMediaAsset } from "@/contexts/media";
import { getBrandConfig } from "@/platform/brand/get-brand-config";
import { resolveRegionNews } from "../../../runtime/region-news";
import { resolveRegionWeather } from "../../../runtime/region-weather";
import {
  DEFAULT_NEWS_BLOCK_DURATION_SECONDS,
  DEFAULT_SLIDE_DURATION_SECONDS,
  DEFAULT_WEBPAGE_SLIDE_DURATION_SECONDS,
} from "../../../shared/playback-defaults";
import { streamableContentTypeForExtension } from "../../../shared/video-extensions";
import type { BroadcastAgendaEventRecord, BroadcastPlaylistItemRecord, PlaylistItemKind } from "../../../contracts/types";
import {
  findActiveAlertMessage,
  findAllAgendas,
  findAllUpcomingAgendaEvents,
  findLayersBySceneId,
  findOutputByToken,
  findSceneById,
  findVisiblePlaylistItemsByPlaylistId,
} from "./store";
import type { AgendaRotationEntry, GetOutputStateQuery, GetOutputStateResult, PlaylistItemSummary } from "./types";

const AGENDA_EVENTS_PER_ROTATION_LIMIT = 6;

function readStringConfig(config: Record<string, unknown>, key: string): string | null {
  const value = config[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

// "kind" nunca é uma coluna própria — sempre derivado aqui, na hora de resolver, a partir da
// extensão (local) ou do contentType (media-asset); "webpage"/"news" são inequívocos pelo
// sourceType. Mesma defesa em profundidade dos outros resolvers do plugin: nunca confia em dado
// gravado antes sem reconferir a fonte real.
async function classifyPlaylistItem(item: BroadcastPlaylistItemRecord): Promise<PlaylistItemSummary> {
  if (item.sourceType === "webpage") {
    return {
      id: item.id,
      order: item.order,
      kind: "webpage",
      durationSeconds: item.durationSeconds ?? DEFAULT_WEBPAGE_SLIDE_DURATION_SECONDS,
      url: item.url,
    };
  }

  if (item.sourceType === "news") {
    return {
      id: item.id,
      order: item.order,
      kind: "news",
      durationSeconds: item.durationSeconds ?? DEFAULT_NEWS_BLOCK_DURATION_SECONDS,
      url: null,
    };
  }

  let contentType: string | null = null;
  if (item.sourceType === "local" && item.relativePath) {
    contentType = streamableContentTypeForExtension(path.extname(item.relativePath));
  } else if (item.sourceType === "media-asset" && item.mediaAssetId) {
    const asset = await getMediaAsset({ id: item.mediaAssetId });
    contentType = asset.success && asset.data ? asset.data.contentType : null;
  }

  const kind: PlaylistItemKind = contentType?.startsWith("image/") ? "image" : "video";
  return {
    id: item.id,
    order: item.order,
    kind,
    durationSeconds: kind === "image" ? (item.durationSeconds ?? DEFAULT_SLIDE_DURATION_SECONDS) : null,
    url: null,
  };
}

// Agrupa os próximos eventos por agenda (uma query só pras duas tabelas, sem N+1) e descarta
// agenda sem nenhum evento futuro — não desperdiça tempo de tela mostrando uma agenda vazia no
// rodízio da layer "agenda".
async function resolveAgendaRotation(): Promise<AgendaRotationEntry[]> {
  const [agendas, events] = await Promise.all([findAllAgendas(), findAllUpcomingAgendaEvents()]);

  const eventsByAgendaId = new Map<string, BroadcastAgendaEventRecord[]>();
  for (const event of events) {
    const bucket = eventsByAgendaId.get(event.agendaId) ?? [];
    if (bucket.length < AGENDA_EVENTS_PER_ROTATION_LIMIT) bucket.push(event);
    eventsByAgendaId.set(event.agendaId, bucket);
  }

  return agendas
    .map((agenda) => ({ agenda, events: eventsByAgendaId.get(agenda.id) ?? [] }))
    .filter((entry) => entry.events.length > 0);
}

// Resolve o estado completo pra primeira renderização da view de saída: a página server component
// chama isto direto (sem round-trip HTTP), e a mesma forma de estado é o que a rota SSE
// (app/api/broadcast/output/[token]/events) manda como primeiro evento de hydration, e o que
// app/api/broadcast/output/[token]/state devolve quando o client refaz a consulta após um evento.
export async function getOutputState(query: GetOutputStateQuery): Promise<GetOutputStateResult> {
  const output = await findOutputByToken(query.token);
  if (!output) {
    return { success: false, error: { code: "broadcast.get-output-state.not_found", message: "Saída não encontrada." } };
  }

  const scene = output.currentSceneId ? await findSceneById(output.currentSceneId) : null;
  const layers = scene ? await findLayersBySceneId(scene.id) : [];

  const videoPlaylistIds = new Set<string>();
  for (const layer of layers) {
    if (layer.type !== "video") continue;
    const playlistId = readStringConfig(layer.config, "playlistId");
    if (playlistId) videoPlaylistIds.add(playlistId);
  }

  const playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]> = {};
  for (const playlistId of videoPlaylistIds) {
    const items = await findVisiblePlaylistItemsByPlaylistId(playlistId);
    playlistItemsByPlaylistId[playlistId] = await Promise.all(items.map(classifyPlaylistItem));
  }
  // "news" agora é um item de playlist manipulável (posição/duração próprias), não mais um
  // checkbox na config da layer — precisa resolver os artigos sempre que algum item classificar
  // como "news" em qualquer playlist referenciada.
  const anyPlaylistHasNewsItem = Object.values(playlistItemsByPlaylistId).some((items) =>
    items.some((item) => item.kind === "news"),
  );

  const resolvedAssetUrlByLayerId: Record<string, string> = {};
  for (const layer of layers) {
    if (layer.type !== "image") continue;
    const mediaAssetId = readStringConfig(layer.config, "mediaAssetId");
    if (!mediaAssetId) continue;
    const asset = await getMediaAsset({ id: mediaAssetId });
    if (asset.success && asset.data) {
      resolvedAssetUrlByLayerId[layer.id] = asset.data.url;
    }
  }

  // "agenda" também mostra o clima (canto inferior direito do painel — pedido: "no canto inferior
  // direito o clima e tempo"), não só a layer "info" dedicada.
  const needsWeather = layers.some((layer) => layer.type === "info" || layer.type === "agenda");
  const needsNews = layers.some((layer) => layer.type === "news") || anyPlaylistHasNewsItem;
  const needsAgenda = layers.some((layer) => layer.type === "agenda");
  const needsAlert = layers.some((layer) => layer.type === "alert");

  const [regionWeather, regionNews, agendaRotation, activeAlertMessage, brandLogoUrl] = await Promise.all([
    needsWeather ? resolveRegionWeather() : Promise.resolve(null),
    needsNews ? resolveRegionNews() : Promise.resolve([]),
    needsAgenda ? resolveAgendaRotation() : Promise.resolve([]),
    needsAlert ? findActiveAlertMessage() : Promise.resolve(null),
    needsAgenda ? getBrandConfig("png").then((brand) => brand.logoUrl) : Promise.resolve(null),
  ]);

  return {
    success: true,
    data: {
      outputId: output.id,
      drawerOpen: output.drawerOpen,
      scene,
      layers,
      playlistItemsByPlaylistId,
      resolvedAssetUrlByLayerId,
      regionWeather,
      regionNews,
      agendaRotation,
      activeAlertMessage,
      brandLogoUrl,
    },
  };
}
