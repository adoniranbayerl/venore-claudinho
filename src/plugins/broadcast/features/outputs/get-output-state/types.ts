import type { OperationResult } from "@/shared/types";
import type {
  AgendaRotationEntry,
  AgendaRotationEvent,
  BroadcastLayerRecord,
  BroadcastSceneRecord,
  PlaylistItemSummary,
  RegionNewsArticle,
  RegionWeather,
} from "../../../contracts/types";

export type GetOutputStateQuery = { token: string };

export type { AgendaRotationEntry, AgendaRotationEvent, PlaylistItemSummary };

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
  footerOpen: boolean;
  scene: BroadcastSceneRecord | null;
  layers: BroadcastLayerRecord[];
  playlistItemsByPlaylistId: Record<string, PlaylistItemSummary[]>;
  resolvedAssetUrlByLayerId: Record<string, string>;
  regionWeather: RegionWeather | null;
  regionNews: RegionNewsArticle[];
  agendaRotation: AgendaRotationEntry[];
  activeAlertMessage: string | null;
  brandLogoUrl: string | null;
  // Cor da barra de marca (logo+relógio+temperatura) no rodapé da camada "video" — sempre um hex
  // válido (default de BROADCAST_SETTINGS.brandColor quando o operador não configurou nada).
  brandColor: string;
};

export type GetOutputStateResult = OperationResult<BroadcastOutputState>;
