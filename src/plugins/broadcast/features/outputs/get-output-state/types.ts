import type { OperationResult } from "@/shared/types";
import type {
  AgendaRotationEntry,
  BroadcastLayerRecord,
  BroadcastSceneRecord,
  PlaylistItemSummary,
  RegionNewsArticle,
  RegionWeather,
} from "../../../contracts/types";

export type GetOutputStateQuery = { token: string };

export type { AgendaRotationEntry, PlaylistItemSummary };

// Estado completo e autossuficiente pra renderizar a view de saída sem nenhuma outra chamada
// autenticada: playlistItemsByPlaylistId resolve o "o que uma layer de vídeo toca" (a layer só
// guarda config.playlistId), já classificado por kind e sem os itens escondidos;
// resolvedAssetUrlByLayerId resolve config.mediaAssetId de uma layer "image" (a de vídeo já
// resolve por si via app/api/broadcast/stream); regionWeather/regionNews/agendas/activeAlert só
// são preenchidos quando a cena atual de fato tem a layer correspondente — evita chamada externa
// (ou consulta) desnecessária quando a cena não usa esse tipo. activeAlert é a única exceção
// "sempre resolvida se a cena tem layer 'alert'" que ignora currentSceneId pra decidir o que
// mostrar — o aviso em si é global (não por cena).
export type BroadcastOutputState = {
  outputId: string;
  drawerOpen: boolean;
  scene: BroadcastSceneRecord | null;
  layers: BroadcastLayerRecord[];
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>;
  resolvedAssetUrlByLayerId: Record<string, string>;
  regionWeather: RegionWeather | null;
  regionNews: RegionNewsArticle[];
  agendaRotation: AgendaRotationEntry[];
  activeAlertMessage: string | null;
  brandLogoUrl: string | null;
};

export type GetOutputStateResult = OperationResult<BroadcastOutputState>;
