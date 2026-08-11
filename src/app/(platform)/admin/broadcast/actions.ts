"use server";

import { revalidatePath } from "next/cache";
import {
  addMediaAssetPlaylistItem,
  addNewsPlaylistItem,
  addScannedPlaylistItems,
  addWebpagePlaylistItem,
  clearAlert,
  createAgenda,
  createAgendaEvent,
  createOutput,
  createPlaylist,
  deleteAgenda,
  deleteAgendaEvent,
  deleteOutput,
  deletePlaylist,
  deletePlaylistItem,
  publishAlert,
  reorderAgendas,
  reorderPlaylistItems,
  scanPlaylistFolder,
  setAgendaEditors,
  setAgendaOutputs,
  setOutputDrawer,
  setOutputEditors,
  setOutputFooter,
  setOutputPlaylist,
  togglePlaylistItemVisibility,
  updateAgenda,
  updateAgendaEvent,
  updatePlaylistItem,
  BROADCAST_SETTINGS,
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

export async function createPlaylistAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createPlaylist({ name: requireString(formData, "name") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deletePlaylistAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deletePlaylist({ playlistId: requireString(formData, "playlistId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Estado próprio (não o BroadcastActionState genérico) — o scan agora é só uma prévia de leitura
// (pedido: "quero poder escolher o que entra... e o que não entra"), então a ação precisa devolver
// os candidatos pro client renderizar os checkboxes, não só sucesso/erro. Sem revalidatePath aqui
// de propósito: nada foi gravado ainda.
export type ScanPlaylistFolderState = {
  error: string | null;
  toAdd: string[];
  toRemove: { id: string; relativePath: string }[];
};

export async function scanPlaylistFolderAction(
  _prevState: ScanPlaylistFolderState,
  formData: FormData,
): Promise<ScanPlaylistFolderState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR, toAdd: [], toRemove: [] };

  const result = await scanPlaylistFolder({ playlistId: requireString(formData, "playlistId") });
  if (!result.success) return { error: result.error.message, toAdd: [], toRemove: [] };

  return { error: null, toAdd: result.data.toAdd, toRemove: result.data.toRemove };
}

export async function addScannedPlaylistItemsAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const playlistId = requireString(formData, "playlistId");
  let relativePaths: string[];
  try {
    relativePaths = JSON.parse(String(formData.get("relativePaths") ?? "[]"));
  } catch {
    return { error: "Seleção de vídeos inválida." };
  }

  const result = await addScannedPlaylistItems({ playlistId, relativePaths });
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

export async function updatePlaylistItemAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updatePlaylistItem({
    itemId: requireString(formData, "itemId"),
    title: requireString(formData, "title") || undefined,
    durationSeconds: optionalNumber(formData, "durationSeconds"),
    url: requireString(formData, "url") || undefined,
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

// Botões "mover pra cima/baixo" reenviam a lista inteira já reordenada (JSON) — mesmo padrão de
// academy (reorderLessonSectionsAction): mais simples e mais robusto (funciona em qualquer
// dispositivo/teclado, sem depender de drag-and-drop) que manter uma lib de arrastar-soltar só
// pra isto.
export async function reorderPlaylistItemsAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const playlistId = requireString(formData, "playlistId");
  let itemIds: string[];
  try {
    itemIds = JSON.parse(String(formData.get("itemIds") ?? "[]"));
  } catch {
    return { error: "Ordem de itens inválida." };
  }

  const result = await reorderPlaylistItems({ playlistId, itemIds });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Cria a saída já com sua cena padrão de 3 camadas fixas provisionada (vídeo tocando a playlist
// escolhida + agenda + aviso rápido) — ver create-output/store.ts. Nenhuma configuração manual de
// cena/camada existe mais nesta tela (pedido explícito: "você já define isso").
export async function createOutputAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createOutput({
    name: requireString(formData, "name"),
    playlistId: requireString(formData, "playlistId"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Troca qual playlist a camada de vídeo da saída toca — único jeito de mudar "o que passa" depois
// que a saída já foi criada, já que não existe mais tela de cenas/camadas.
export async function setOutputPlaylistAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setOutputPlaylist({
    outputId: requireString(formData, "outputId"),
    playlistId: requireString(formData, "playlistId"),
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

export async function setOutputFooterAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setOutputFooter({
    outputId: requireString(formData, "outputId"),
    footerOpen: formData.get("footerOpen") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function deleteOutputAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteOutput({ outputId: requireString(formData, "outputId") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Substitui o conjunto inteiro de responsáveis desta saída — mesmo padrão de
// setAgendaEditorsAction.
export async function setOutputEditorsAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const outputId = requireString(formData, "outputId");
  let userIds: string[];
  try {
    userIds = JSON.parse(String(formData.get("userIds") ?? "[]"));
  } catch {
    return { error: "Seleção de responsáveis inválida." };
  }

  const result = await setOutputEditors({ outputId, userIds });
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
    logoMediaAssetId: requireString(formData, "logoMediaAssetId") || undefined,
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
    logoMediaAssetId: requireString(formData, "logoMediaAssetId") || undefined,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Mesmo padrão de reorderPlaylistItemsAction — botões mover pra cima/baixo, lista inteira via JSON.
export async function reorderAgendasAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  let agendaIds: string[];
  try {
    agendaIds = JSON.parse(String(formData.get("agendaIds") ?? "[]"));
  } catch {
    return { error: "Ordem de agendas inválida." };
  }

  const result = await reorderAgendas({ agendaIds });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Substitui o conjunto inteiro de saídas vinculadas a esta agenda (checkboxes, todas resubmetidas
// via JSON) — vazio é um valor válido ("aparece em todas as saídas", ver comentário no schema).
export async function setAgendaOutputsAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const agendaId = requireString(formData, "agendaId");
  let outputIds: string[];
  try {
    outputIds = JSON.parse(String(formData.get("outputIds") ?? "[]"));
  } catch {
    return { error: "Seleção de saídas inválida." };
  }

  const result = await setAgendaOutputs({ agendaId, outputIds });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

// Substitui o conjunto inteiro de responsáveis desta agenda — pedido explícito: "adicionar um
// responsável (role editor pra cima) com acesso e permissão para alterar apenas a agenda
// atribuída". Mesmo padrão de setAgendaOutputsAction (checkboxes, JSON).
export async function setAgendaEditorsAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const agendaId = requireString(formData, "agendaId");
  let userIds: string[];
  try {
    userIds = JSON.parse(String(formData.get("userIds") ?? "[]"));
  } catch {
    return { error: "Seleção de responsáveis inválida." };
  }

  const result = await setAgendaEditors({ agendaId, userIds });
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
    recurring: formData.get("recurring") === "on",
    coverMediaAssetId: requireString(formData, "coverMediaAssetId") || undefined,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateAgendaEventAction(_prevState: BroadcastActionState, formData: FormData): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const startAtRaw = requireString(formData, "startAt");
  const startAt = new Date(startAtRaw);

  const result = await updateAgendaEvent({
    eventId: requireString(formData, "eventId"),
    title: requireString(formData, "title"),
    description: requireString(formData, "description") || undefined,
    startAt,
    recurring: formData.get("recurring") === "on",
    coverMediaAssetId: requireString(formData, "coverMediaAssetId") || undefined,
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

export async function updateBroadcastBrandColorAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setSetting({ key: BROADCAST_SETTINGS.brandColor.key, value: requireString(formData, "brandColor") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function updateBroadcastNewsExcludeKeywordsAction(
  _prevState: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  if (!(await isPluginActive("broadcast"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setSetting({
    key: BROADCAST_SETTINGS.newsExcludeKeywords.key,
    value: requireString(formData, "newsExcludeKeywords"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(returnTo);
  return { error: null };
}

export async function getBroadcastRegion(): Promise<string> {
  const result = await getSetting({ key: BROADCAST_SETTINGS.region.key });
  return result.success && typeof result.data?.value === "string" ? result.data.value : "";
}

export async function getBroadcastBrandColor(): Promise<string> {
  const result = await getSetting({ key: BROADCAST_SETTINGS.brandColor.key });
  return result.success && typeof result.data?.value === "string" ? result.data.value : BROADCAST_SETTINGS.brandColor.defaultValue;
}

export async function getBroadcastNewsExcludeKeywords(): Promise<string> {
  const result = await getSetting({ key: BROADCAST_SETTINGS.newsExcludeKeywords.key });
  return result.success && typeof result.data?.value === "string" ? result.data.value : "";
}
