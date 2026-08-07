// Barrel público do plugin (regra 7/8 do AGENTS.md) — outros contexts/plugins/platform só podem
// importar daqui ou de ./contracts, nunca de ./database/schema, ./features/*/store ou
// ./features/*/service diretamente. Expandido conforme as features de cada fase forem entrando.
export { BROADCAST_SETTINGS } from "./shared/settings";
export type { BroadcastSettingField } from "./shared/settings";

export {
  BROADCAST_LAYER_TYPES,
  BROADCAST_PLAYLIST_ITEM_SOURCE_TYPES,
} from "./contracts/types";
export type {
  BroadcastSceneRecord,
  BroadcastLayerType,
  BroadcastLayerRecord,
  BroadcastPlaylistRecord,
  BroadcastPlaylistItemSourceType,
  BroadcastPlaylistItemRecord,
  BroadcastOutputRecord,
} from "./contracts/types";

export { createPlaylistHandler as createPlaylist } from "./features/playlists/create-playlist/handler";
export { listPlaylistsHandler as listPlaylists } from "./features/playlists/list-playlists/handler";
export { listPlaylistItemsHandler as listPlaylistItems } from "./features/playlists/list-playlist-items/handler";
export {
  addMediaAssetPlaylistItemHandler as addMediaAssetPlaylistItem,
} from "./features/playlists/add-media-asset-playlist-item/handler";
export { deletePlaylistItemHandler as deletePlaylistItem } from "./features/playlists/delete-playlist-item/handler";
export { scanPlaylistFolderHandler as scanPlaylistFolder } from "./features/playlists/scan-playlist-folder/handler";
// Sem authorizeActor (ver o próprio handler) — só a rota de stream (app/api/broadcast/stream)
// chama isto, nunca uma action de UI autenticada por sessão de admin.
export {
  resolveStreamableItemHandler as resolveStreamableItem,
} from "./features/playlists/resolve-streamable-playlist-item/handler";

export type { CreatePlaylistInput, CreatePlaylistResult } from "./features/playlists/create-playlist/types";
export type { ListPlaylistsResult } from "./features/playlists/list-playlists/types";
export type {
  ListPlaylistItemsQuery,
  ListPlaylistItemsResult,
} from "./features/playlists/list-playlist-items/types";
export type {
  AddMediaAssetPlaylistItemInput,
  AddMediaAssetPlaylistItemResult,
} from "./features/playlists/add-media-asset-playlist-item/types";
export type {
  DeletePlaylistItemInput,
  DeletePlaylistItemResult,
} from "./features/playlists/delete-playlist-item/types";
export {
  addWebpagePlaylistItemHandler as addWebpagePlaylistItem,
} from "./features/playlists/add-webpage-playlist-item/handler";
export type {
  AddWebpagePlaylistItemInput,
  AddWebpagePlaylistItemResult,
} from "./features/playlists/add-webpage-playlist-item/types";
export {
  addNewsPlaylistItemHandler as addNewsPlaylistItem,
} from "./features/playlists/add-news-playlist-item/handler";
export type {
  AddNewsPlaylistItemInput,
  AddNewsPlaylistItemResult,
} from "./features/playlists/add-news-playlist-item/types";
export {
  togglePlaylistItemVisibilityHandler as togglePlaylistItemVisibility,
} from "./features/playlists/toggle-playlist-item-visibility/handler";
export type {
  TogglePlaylistItemVisibilityInput,
  TogglePlaylistItemVisibilityResult,
} from "./features/playlists/toggle-playlist-item-visibility/types";
export type {
  ScanPlaylistFolderInput,
  ScanPlaylistFolderResult,
} from "./features/playlists/scan-playlist-folder/types";
export type {
  ResolveStreamableItem,
  ResolveStreamableItemQuery,
  ResolveStreamableItemResult,
} from "./features/playlists/resolve-streamable-playlist-item/types";

// Só pra app/api/broadcast/stream (Range request parsing) — a rota nunca importa de dentro de
// ./shared diretamente, sempre pelo barrel, mesmo padrão de outras rotas de plugin (ver
// app/api/birthdays/import-template/route.ts).
export { parseRangeHeader } from "./shared/range-header";

export { createSceneHandler as createScene } from "./features/scenes/create-scene/handler";
export { listScenesHandler as listScenes } from "./features/scenes/list-scenes/handler";
export { updateSceneHandler as updateScene } from "./features/scenes/update-scene/handler";
export { deleteSceneHandler as deleteScene } from "./features/scenes/delete-scene/handler";

export type { CreateSceneInput, CreateSceneResult } from "./features/scenes/create-scene/types";
export type { ListScenesResult } from "./features/scenes/list-scenes/types";
export type { UpdateSceneInput, UpdateSceneResult } from "./features/scenes/update-scene/types";
export type { DeleteSceneInput, DeleteSceneResult } from "./features/scenes/delete-scene/types";

export { createLayerHandler as createLayer } from "./features/layers/create-layer/handler";
export { listLayersHandler as listLayers } from "./features/layers/list-layers/handler";
export { updateLayerHandler as updateLayer } from "./features/layers/update-layer/handler";
export { deleteLayerHandler as deleteLayer } from "./features/layers/delete-layer/handler";

export type { CreateLayerInput, CreateLayerResult } from "./features/layers/create-layer/types";
export type { ListLayersQuery, ListLayersResult } from "./features/layers/list-layers/types";
export type { UpdateLayerInput, UpdateLayerResult } from "./features/layers/update-layer/types";
export type { DeleteLayerInput, DeleteLayerResult } from "./features/layers/delete-layer/types";

export { createOutputHandler as createOutput } from "./features/outputs/create-output/handler";
export { listOutputsHandler as listOutputs } from "./features/outputs/list-outputs/handler";
export { setOutputSceneHandler as setOutputScene } from "./features/outputs/set-output-scene/handler";
export { setOutputDrawerHandler as setOutputDrawer } from "./features/outputs/set-output-drawer/handler";
// Sem authorizeActor (ver o próprio handler) — acesso por token, chamado pela página de saída
// (server component) e pela rota SSE, nunca por uma action de UI autenticada por sessão de admin.
export { getOutputStateHandler as getOutputState } from "./features/outputs/get-output-state/handler";

export type { CreateOutputInput, CreateOutputResult } from "./features/outputs/create-output/types";
export type { ListOutputsResult } from "./features/outputs/list-outputs/types";
export type { SetOutputSceneInput, SetOutputSceneResult } from "./features/outputs/set-output-scene/types";
export type { SetOutputDrawerInput, SetOutputDrawerResult } from "./features/outputs/set-output-drawer/types";
export type {
  AgendaRotationEntry,
  BroadcastOutputState,
  GetOutputStateQuery,
  GetOutputStateResult,
  PlaylistItemSummary,
} from "./features/outputs/get-output-state/types";

// Só pra view de saída (Fase 4/5) calcular a geometria efetiva de uma layer quando a drawer está
// aberta — a rota nunca importa de dentro de ./shared diretamente (mesmo padrão de
// parseRangeHeader acima).
export { resolveLayerGeometry } from "./shared/layer-geometry";
export type { LayerGeometry } from "./shared/layer-geometry";

export type { BroadcastOutputEvent } from "./contracts/types";
// Infra de runtime (pub/sub em memória, não uma feature — ver runtime/output-bus.ts). Só pra
// app/api/broadcast/output/[token]/events (SSE) se inscrever; nunca chamado de uma action de UI.
export { subscribeToOutputEvents } from "./runtime/output-bus";

export { createAgendaHandler as createAgenda } from "./features/agenda/create-agenda/handler";
export { updateAgendaHandler as updateAgenda } from "./features/agenda/update-agenda/handler";
export { listAgendasHandler as listAgendas } from "./features/agenda/list-agendas/handler";
export { deleteAgendaHandler as deleteAgenda } from "./features/agenda/delete-agenda/handler";
export { createAgendaEventHandler as createAgendaEvent } from "./features/agenda/create-agenda-event/handler";
export { listAgendaEventsHandler as listAgendaEvents } from "./features/agenda/list-agenda-events/handler";
export { deleteAgendaEventHandler as deleteAgendaEvent } from "./features/agenda/delete-agenda-event/handler";

export type { CreateAgendaInput, CreateAgendaResult } from "./features/agenda/create-agenda/types";
export type { UpdateAgendaInput, UpdateAgendaResult } from "./features/agenda/update-agenda/types";
export type { ListAgendasResult } from "./features/agenda/list-agendas/types";
export type { DeleteAgendaInput, DeleteAgendaResult } from "./features/agenda/delete-agenda/types";
export type { CreateAgendaEventInput, CreateAgendaEventResult } from "./features/agenda/create-agenda-event/types";
export type { ListAgendaEventsResult } from "./features/agenda/list-agenda-events/types";
export type { DeleteAgendaEventInput, DeleteAgendaEventResult } from "./features/agenda/delete-agenda-event/types";

export { publishAlertHandler as publishAlert } from "./features/alerts/publish-alert/handler";
export { clearAlertHandler as clearAlert } from "./features/alerts/clear-alert/handler";
export type { PublishAlertInput, PublishAlertResult } from "./features/alerts/publish-alert/types";
export type { ClearAlertResult } from "./features/alerts/clear-alert/types";

export type {
  BroadcastAgendaRecord,
  BroadcastAgendaEventRecord,
  BroadcastAlertRecord,
  PlaylistItemKind,
  RegionNewsArticle,
  RegionWeather,
} from "./contracts/types";
