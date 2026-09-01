import { asc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { boards, queues } from "../database/schema";
import type { BoardLayout, BoardRecord } from "../contracts/types";

// Acesso a `boards` compartilhado pelas features de CRUD (features/boards/*), pela página pública
// do painel (get-board) e pelo feed de polling (get-board-feed) — fora de um store.ts por feature
// de propósito, mesmo racional de shared/kiosk-store.ts: nenhuma feature é dona natural da tabela
// e a leitura nasce em vários pontos. As opções de fila para o formulário do admin reusam
// listActiveQueueOptions de shared/kiosk-store.ts.

function toRecord(row: typeof boards.$inferSelect): BoardRecord {
  return {
    id: row.id,
    token: row.token,
    label: row.label,
    queueId: row.queueId ?? null,
    layout: row.layout as BoardLayout,
    showAssignee: row.showAssignee,
    refreshSeconds: row.refreshSeconds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listBoards(): Promise<BoardRecord[]> {
  const rows = await db.select().from(boards).orderBy(asc(boards.createdAt), asc(boards.id));
  return rows.map(toRecord);
}

export async function findBoardById(id: string): Promise<BoardRecord | null> {
  const [row] = await db.select().from(boards).where(eq(boards.id, id)).limit(1);
  return row ? toRecord(row) : null;
}

export async function findBoardByToken(token: string): Promise<BoardRecord | null> {
  const [row] = await db.select().from(boards).where(eq(boards.token, token)).limit(1);
  return row ? toRecord(row) : null;
}

export async function insertBoard(input: {
  token: string;
  label: string;
  queueId: string | null;
  layout: BoardLayout;
  showAssignee: boolean;
  refreshSeconds: number;
}): Promise<BoardRecord> {
  const [row] = await db.insert(boards).values(input).returning();
  return toRecord(row);
}

export async function updateBoardFields(
  id: string,
  fields: {
    label?: string;
    queueId?: string | null;
    layout?: BoardLayout;
    showAssignee?: boolean;
    refreshSeconds?: number;
  },
): Promise<BoardRecord | null> {
  const [row] = await db
    .update(boards)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(boards.id, id))
    .returning();
  return row ? toRecord(row) : null;
}

export async function deleteBoardById(id: string): Promise<boolean> {
  const rows = await db.delete(boards).where(eq(boards.id, id)).returning({ id: boards.id });
  return rows.length > 0;
}

// Nome da fila do painel — sem filtrar por arquivada (o painel continua válido apontado para uma
// fila que foi arquivada depois; a FK `cascade` só dispara em DELETE de fila, não em archive).
export async function findQueueNameById(queueId: string): Promise<string | null> {
  const [row] = await db.select({ name: queues.name }).from(queues).where(eq(queues.id, queueId)).limit(1);
  return row?.name ?? null;
}
