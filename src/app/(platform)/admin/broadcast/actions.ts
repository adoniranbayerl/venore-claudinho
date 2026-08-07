"use server";

import { revalidatePath } from "next/cache";
import {
  addMediaAssetPlaylistItem,
  addNewsPlaylistItem,
  addWebpagePlaylistItem,
  clearAlert,
  createAgenda,
  createAgendaEvent,
  createLayer,
  createOutput,
  createPlaylist,
  createScene,
  deleteAgenda,
  deleteAgendaEvent,
  deleteLayer,
  deletePlaylistItem,
  deleteScene,
  publishAlert,
  scanPlaylistFolder,
  setOutputDrawer,
  setOutputScene,
  togglePlaylistItemVisibility,
  updateAgenda,
  updateLayer,
  updateScene,
  BROADCAST_LAYER_TYPES,
  BROADCAST_SETTINGS,
  type BroadcastLayerType,
} from "@/plugins/broadcast";
import { getSetting, setSetting } from "@/contexts/settings";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

export type BroadcastActionState = { error: string | null };

const returnTo = "/admin/broadcast";
const PLUGIN_DISABLED_ERROR = "O plugin Broadcast Studio está desabilitado.";

function requireString(formData: FormData, field: string): string {
  return String(formData.get(field) ?? "").trim();
}

function requireNumber(formData: FormData, field: string, fallback: number): number {
  const raw = formData.get(field);
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function optionalNumber(formData: FormData, field: string): number | null {
  const raw = formData.get(field);
  if (raw === null || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

// Constrói layers.config a partir de campos nomeados e guiados por tipo (um <select>/<input> por
// dado que a layer realmente precisa), em vez do operador escrever JSON à mão — cada `case` aqui
// espelha exatamente os campos que layer-renderer.tsx (view de saída) lê de volta. Usado por
// createLayerAction e updateLayerAction (o form de edição reenvia o mesmo `type`, mesmo ele sendo
// imutável em updateLayer — só serve pra esta função saber quais campos ler de volta).
// "info"/"news"/"agenda" não têm campo nenhum — são resolvidos a partir de broadcast.region e da
// agenda interna, zero configuração manual por camada (pedido explícito de simplificação).
function buildLayerConfigFromFields(type: BroadcastLayerType, formData: FormData): Record<string, unknown> {
  switch (type) {
    case "video": {
      const playlistId = requireString(formData, "playlistId");
      return playlistId ? { playlistId } : {};
    }
    case "text": {
      const config: Record<string, unknown> = {};
      const text = requireString(formData, "text");
      const color = requireString(formData, "color");
      if (text) config.text = text;
      if (color) config.color = color;
      return config;
    }
    case "image": {
      const mediaAssetId = requireString(formData, "mediaAssetId");
      return mediaAssetId ? { mediaAssetId } : {};
    }
    case "info":
    case "news":
    case "agenda":
    case "alert":
      return {};
    default:
      return {};
  }
}

// drawerEnabled=true + os 4 campos numéricos viram layers.config.drawerVariant (lido por
// resolveLayerGeometry na view de saída) — o operador nunca escreve JSON, só marca a caixa e
// ajusta os 4 números que aparecem.
function buildDrawerVariantFromFields(formData: FormData): Record<string, number> | null {
  if (formData.get("drawerEnabled") !== "true") return null;

  const variant: Record<string, number> = {};
  for (const [field, formField] of [
    ["x", "drawerX"],
    ["y", "drawerY"],
    ["width", "drawerWidth"],
    ["height", "drawerHeight"],
  ] as const) {
    const raw = formData.get(formField);
    if (raw === null || raw === "") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) variant[field] = value;
  }

  return Object.keys(variant).length > 0 ? variant : null;
}

export async function createPlaylistAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createPlaylist({
    name: requireString(formData, "name"),
    folderPath: requireString(formData, "folderPath") || undefined,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function scanPlaylistFolderAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await scanPlaylistFolder({ playlistId: requireString(formData, "playlistId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function addMediaAssetPlaylistItemAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await addMediaAssetPlaylistItem({
    playlistId: requireString(formData, "playlistId"),
    mediaAssetId: requireString(formData, "mediaAssetId"),
    title: requireString(formData, "title") || undefined,
    durationSeconds: optionalNumber(formData, "durationSeconds"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function addWebpagePlaylistItemAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await addWebpagePlaylistItem({
    playlistId: requireString(formData, "playlistId"),
    url: requireString(formData, "url"),
    title: requireString(formData, "title") || undefined,
    durationSeconds: optionalNumber(formData, "durationSeconds"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function addNewsPlaylistItemAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await addNewsPlaylistItem({
    playlistId: requireString(formData, "playlistId"),
    title: requireString(formData, "title") || undefined,
    durationSeconds: optionalNumber(formData, "durationSeconds"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function togglePlaylistItemVisibilityAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await togglePlaylistItemVisibility({
    itemId: requireString(formData, "itemId"),
    hidden: formData.get("hidden") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deletePlaylistItemAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deletePlaylistItem({ itemId: requireString(formData, "itemId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function createSceneAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createScene({ key: requireString(formData, "key"), name: requireString(formData, "name") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateSceneAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateScene({
    sceneId: requireString(formData, "sceneId"),
    name: requireString(formData, "name"),
    order: requireNumber(formData, "order", 0),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteSceneAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteScene({ sceneId: requireString(formData, "sceneId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function createLayerAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const type = requireString(formData, "type");
  if (!BROADCAST_LAYER_TYPES.includes(type as BroadcastLayerType)) {
    return { error: `Tipo de camada desconhecido: "${type}".` };
  }
  const layerType = type as BroadcastLayerType;

  const config = buildLayerConfigFromFields(layerType, formData);
  const drawerVariant = buildDrawerVariantFromFields(formData);
  if (drawerVariant) config.drawerVariant = drawerVariant;

  const result = await createLayer({
    sceneId: requireString(formData, "sceneId"),
    type: layerType,
    name: requireString(formData, "name"),
    x: requireNumber(formData, "x", 0),
    y: requireNumber(formData, "y", 0),
    width: requireNumber(formData, "width", 100),
    height: requireNumber(formData, "height", 100),
    zIndex: requireNumber(formData, "zIndex", 0),
    config,
    visible: formData.get("visible") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateLayerAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const type = requireString(formData, "type");
  if (!BROADCAST_LAYER_TYPES.includes(type as BroadcastLayerType)) {
    return { error: `Tipo de camada desconhecido: "${type}".` };
  }

  const config = buildLayerConfigFromFields(type as BroadcastLayerType, formData);
  const drawerVariant = buildDrawerVariantFromFields(formData);
  if (drawerVariant) config.drawerVariant = drawerVariant;

  const result = await updateLayer({
    layerId: requireString(formData, "layerId"),
    name: requireString(formData, "name"),
    x: requireNumber(formData, "x", 0),
    y: requireNumber(formData, "y", 0),
    width: requireNumber(formData, "width", 100),
    height: requireNumber(formData, "height", 100),
    zIndex: requireNumber(formData, "zIndex", 0),
    config,
    visible: formData.get("visible") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteLayerAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteLayer({ layerId: requireString(formData, "layerId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function createOutputAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createOutput({ name: requireString(formData, "name") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function setOutputSceneAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  // "none" é o sentinel do <Select> em outputs-section.tsx (Radix Select não aceita value="").
  const sceneId = requireString(formData, "sceneId");
  const result = await setOutputScene({
    outputId: requireString(formData, "outputId"),
    sceneId: sceneId && sceneId !== "none" ? sceneId : null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function setOutputDrawerAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setOutputDrawer({
    outputId: requireString(formData, "outputId"),
    drawerOpen: formData.get("drawerOpen") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function createAgendaAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createAgenda({
    name: requireString(formData, "name"),
    displaySeconds: optionalNumber(formData, "displaySeconds") ?? undefined,
    backgroundColor: requireString(formData, "backgroundColor") || undefined,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateAgendaAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateAgenda({
    agendaId: requireString(formData, "agendaId"),
    name: requireString(formData, "name"),
    displaySeconds: requireNumber(formData, "displaySeconds", 20),
    backgroundColor: requireString(formData, "backgroundColor") || undefined,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteAgendaAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteAgenda({ agendaId: requireString(formData, "agendaId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function createAgendaEventAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const startAtRaw = requireString(formData, "startAt");
  const startAt = new Date(startAtRaw);

  const result = await createAgendaEvent({
    agendaId: requireString(formData, "agendaId"),
    title: requireString(formData, "title"),
    description: requireString(formData, "description") || undefined,
    startAt,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteAgendaEventAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteAgendaEvent({ eventId: requireString(formData, "eventId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function publishAlertAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await publishAlert({
    message: requireString(formData, "message"),
    durationSeconds: requireNumber(formData, "durationSeconds", 30),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Sem parâmetros declarados de propósito (useActionState sempre chama com (prevState, formData),
// mas nenhum dos dois é usado aqui — TS aceita uma implementação com menos parâmetros que o tipo
// esperado, e assim não sobra parâmetro não utilizado pro lint reclamar).
export async function clearAlertAction(): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await clearAlert();
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Passam por contexts/settings direto (setSetting), gateado por settings.manage — mesmo padrão de
// updateBirthdaysAppearanceAction (admin/birthdays/appearance/actions.ts). Ver comentário no
// manifest.ts sobre por que não existe uma permission "broadcast.settings" própria.
export async function updateBroadcastRootFolderAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setSetting({ key: BROADCAST_SETTINGS.rootFolder.key, value: requireString(formData, "rootFolder") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateBroadcastRegionAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setSetting({ key: BROADCAST_SETTINGS.region.key, value: requireString(formData, "region") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function getBroadcastRootFolder(): Promise<string> {
  const result = await getSetting({ key: BROADCAST_SETTINGS.rootFolder.key });
  return result.success && typeof result.data?.value === "string" ? result.data.value : "";
}

export async function getBroadcastRegion(): Promise<string> {
  const result = await getSetting({ key: BROADCAST_SETTINGS.region.key });
  return result.success && typeof result.data?.value === "string" ? result.data.value : "";
}
