import { and, asc, desc, eq, gt, gte, isNotNull, or } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import {
  broadcastAgendaEvents,
  broadcastAgendas,
  broadcastAlerts,
  broadcastLayers,
  broadcastOutputAgendas,
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
// desaparecer da reprodução na TV sem precisar apagar o cadastro. Desempate por createdAt/id
// depois de order: dois itens com o mesmo order (achado real — duas rotas de "adicionar" podem
// calcular o mesmo "próximo order" se rodarem próximas no tempo) deixavam a ordem entre eles
// instável entre uma leitura e outra do Postgres (sem ORDER BY secundário, empate não tem ordem
// garantida) — isso fazia o índice de rotação do client (PlaylistLayer) apontar pra um item
// diferente do que apontava antes depois de um refetch de estado, "pulando"/travando a playlist.
export async function findVisiblePlaylistItemsByPlaylistId(playlistId: string): Promise<BroadcastPlaylistItemRecord[]> {
  const rows = await db
    .select()
    .from(broadcastPlaylistItems)
    .where(and(eq(broadcastPlaylistItems.playlistId, playlistId), eq(broadcastPlaylistItems.hidden, false)))
    .orderBy(asc(broadcastPlaylistItems.order), asc(broadcastPlaylistItems.createdAt), asc(broadcastPlaylistItems.id));
  return rows as BroadcastPlaylistItemRecord[];
}

// Mesmo racional de desempate de findVisiblePlaylistItemsByPlaylistId acima.
export async function findAllAgendas(): Promise<BroadcastAgendaRecord[]> {
  const rows = await db
    .select()
    .from(broadcastAgendas)
    .orderBy(asc(broadcastAgendas.order), asc(broadcastAgendas.createdAt), asc(broadcastAgendas.id));
  return rows as BroadcastAgendaRecord[];
}

// Todos os eventos futuros OU em andamento de todas as agendas numa query só (evita N+1 — o
// agrupamento por agenda acontece em JS, no service) — MAIS todo evento recurring=true, mesmo com
// startAt no passado: pra um evento "toda semana" (ver shared/weekly-recurrence.ts), startAt é só
// a âncora do padrão (dia da semana + horário), nunca a data real da próxima ocorrência, então
// filtrar por "startAt >= agora" excluiria injustamente uma recorrência antiga cujo padrão
// continua valendo.
//
// "startAt >= agora" sozinho excluiria um evento que JÁ COMEÇOU mas ainda não acabou (ex: um
// evento de dias, ou só algumas horas, com endAt no futuro) — pedido explícito: "apenas quando o
// evento acabar, retire ele". Por isso o segundo braço do OR: evento com endAt definido E ainda no
// futuro conta como "em andamento", mesmo com startAt no passado. Evento sem endAt mantém o
// comportamento original (some assim que o horário de início passa).
//
// A ordem por startAt aqui é só um pré-filtro grosseiro — a ordem real (por ocorrência efetiva)
// acontece em JS no service, depois de resolver a data de cada evento recorrente.
export async function findAllUpcomingAgendaEvents(): Promise<BroadcastAgendaEventRecord[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(broadcastAgendaEvents)
    .where(
      or(
        gte(broadcastAgendaEvents.startAt, now),
        and(isNotNull(broadcastAgendaEvents.endAt), gte(broadcastAgendaEvents.endAt, now)),
        eq(broadcastAgendaEvents.recurring, true),
      ),
    )
    .orderBy(asc(broadcastAgendaEvents.startAt));
  return rows as BroadcastAgendaEventRecord[];
}

// Tabela inteira (pequena — um vínculo por linha) carregada de uma vez; o filtro "essa agenda
// aparece nesta saída?" é feito em JS no service (resolveAgendaRotation), não aqui — ver comentário
// no schema (broadcastOutputAgendas) pra entender o modelo "opt-in" (sem linha = não aparece em
// nenhuma saída).
export async function findAllOutputAgendaLinks(): Promise<{ outputId: string; agendaId: string }[]> {
  return db.select({ outputId: broadcastOutputAgendas.outputId, agendaId: broadcastOutputAgendas.agendaId }).from(broadcastOutputAgendas);
}

// Resolve o evento único de um item de playlist "agenda-event" — null quando o evento referenciado
// não existe mais (a FK cascade já teria apagado o item de playlist junto, mas uma corrida entre
// leitura e escrita pode deixar a leitura em voo pegar o estado anterior; classifyPlaylistItem
// degrada bem pra esse caso, mesmo racional de bloco de notícias vazio).
export async function findAgendaEventById(id: string): Promise<BroadcastAgendaEventRecord | null> {
  const [row] = await db.select().from(broadcastAgendaEvents).where(eq(broadcastAgendaEvents.id, id)).limit(1);
  return (row as BroadcastAgendaEventRecord) ?? null;
}

// O aviso ativo é o mais recentemente publicado ainda não expirado — não há conceito de "fila",
// um novo aviso publicado só substitui o anterior (ver publish-alert), mesmo que o anterior ainda
// não tenha expirado. Devolve o expiresAt junto: o client precisa dele pra esconder a faixa no
// instante exato do vencimento, sem esperar o poll de 15s (que fazia um aviso de 10s ficar ~20s
// na tela).
export async function findActiveAlert(): Promise<{ message: string; expiresAt: Date } | null> {
  const [row] = await db
    .select({ message: broadcastAlerts.message, expiresAt: broadcastAlerts.expiresAt })
    .from(broadcastAlerts)
    .where(gt(broadcastAlerts.expiresAt, new Date()))
    .orderBy(desc(broadcastAlerts.createdAt))
    .limit(1);
  return row ?? null;
}
