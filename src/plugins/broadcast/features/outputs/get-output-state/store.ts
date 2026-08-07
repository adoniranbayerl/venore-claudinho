import { and, asc, desc, eq, gt, gte } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import {
  broadcastAgendaEvents,
  broadcastAgendas,
  broadcastAlerts,
  broadcastLayers,
  broadcastOutputs,
  broadcastPlaylistItems,
  broadcastScenes,
} from "../../../database/schema";
import type {
  BroadcastAgendaEventRecord,
  BroadcastAgendaRecord,
  BroadcastLayerRecord,
  BroadcastOutputRecord,
  BroadcastPlaylistItemRecord,
  BroadcastSceneRecord,
} from "../../../contracts/types";

export async function findOutputByToken(token: string): Promise<BroadcastOutputRecord | null> {
  const [row] = await db.select().from(broadcastOutputs).where(eq(broadcastOutputs.token, token)).limit(1);
  return (row as BroadcastOutputRecord) ?? null;
}

export async function findSceneById(id: string): Promise<BroadcastSceneRecord | null> {
  const [row] = await db.select().from(broadcastScenes).where(eq(broadcastScenes.id, id)).limit(1);
  return (row as BroadcastSceneRecord) ?? null;
}

export async function findLayersBySceneId(sceneId: string): Promise<BroadcastLayerRecord[]> {
  const rows = await db
    .select()
    .from(broadcastLayers)
    .where(eq(broadcastLayers.sceneId, sceneId))
    .orderBy(asc(broadcastLayers.zIndex));
  return rows as BroadcastLayerRecord[];
}

// Só itens visíveis (hidden = false) — esconder um item na playlist (Fase 6) precisa
// desaparecer da reprodução na TV sem precisar apagar o cadastro.
export async function findVisiblePlaylistItemsByPlaylistId(playlistId: string): Promise<BroadcastPlaylistItemRecord[]> {
  const rows = await db
    .select()
    .from(broadcastPlaylistItems)
    .where(and(eq(broadcastPlaylistItems.playlistId, playlistId), eq(broadcastPlaylistItems.hidden, false)))
    .orderBy(asc(broadcastPlaylistItems.order));
  return rows as BroadcastPlaylistItemRecord[];
}

export async function findAllAgendas(): Promise<BroadcastAgendaRecord[]> {
  const rows = await db.select().from(broadcastAgendas).orderBy(asc(broadcastAgendas.order));
  return rows as BroadcastAgendaRecord[];
}

// Todos os eventos futuros de todas as agendas numa query só (evita N+1 — o agrupamento por
// agenda acontece em JS, no service).
export async function findAllUpcomingAgendaEvents(): Promise<BroadcastAgendaEventRecord[]> {
  const rows = await db
    .select()
    .from(broadcastAgendaEvents)
    .where(gte(broadcastAgendaEvents.startAt, new Date()))
    .orderBy(asc(broadcastAgendaEvents.startAt));
  return rows as BroadcastAgendaEventRecord[];
}

// O aviso ativo é o mais recentemente publicado ainda não expirado — não há conceito de "fila",
// um novo aviso publicado só substitui o anterior (ver publish-alert), mesmo que o anterior ainda
// não tenha expirado.
export async function findActiveAlertMessage(): Promise<string | null> {
  const [row] = await db
    .select({ message: broadcastAlerts.message })
    .from(broadcastAlerts)
    .where(gt(broadcastAlerts.expiresAt, new Date()))
    .orderBy(desc(broadcastAlerts.createdAt))
    .limit(1);
  return row?.message ?? null;
}
