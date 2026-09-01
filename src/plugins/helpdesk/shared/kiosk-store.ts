import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { kiosks, queues } from "../database/schema";
import type { KioskRecord } from "../contracts/types";

// Acesso a `kiosks` compartilhado pelas features de CRUD (features/kiosks/*), pela página pública
// do quiosque (get-kiosk-by-token) e por submit-kiosk-ticket — fora de um store.ts por feature de
// propósito, mesmo racional de shared/notification-store.ts e shared/ticket-list-store.ts:
// nenhuma feature é dona natural da tabela e a leitura nasce em vários pontos.

function toRecord(row: typeof kiosks.$inferSelect): KioskRecord {
  return {
    id: row.id,
    token: row.token,
    label: row.label,
    queueId: row.queueId ?? null,
    defaultLocation: row.defaultLocation ?? null,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listKiosks(): Promise<KioskRecord[]> {
  const rows = await db.select().from(kiosks).orderBy(asc(kiosks.createdAt), asc(kiosks.id));
  return rows.map(toRecord);
}

export async function findKioskById(id: string): Promise<KioskRecord | null> {
  const [row] = await db.select().from(kiosks).where(eq(kiosks.id, id)).limit(1);
  return row ? toRecord(row) : null;
}

export async function findKioskByToken(token: string): Promise<KioskRecord | null> {
  const [row] = await db.select().from(kiosks).where(eq(kiosks.token, token)).limit(1);
  return row ? toRecord(row) : null;
}

export async function insertKiosk(input: {
  token: string;
  label: string;
  queueId: string | null;
  defaultLocation: string | null;
  active: boolean;
}): Promise<KioskRecord> {
  const [row] = await db.insert(kiosks).values(input).returning();
  return toRecord(row);
}

export async function updateKioskFields(
  id: string,
  fields: { label?: string; queueId?: string | null; defaultLocation?: string | null; active?: boolean },
): Promise<KioskRecord | null> {
  const [row] = await db
    .update(kiosks)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(kiosks.id, id))
    .returning();
  return row ? toRecord(row) : null;
}

// Filas ativas (não arquivadas) — para o admin escolher a fila fixada do quiosque e para o
// formulário público quando o quiosque não fixa nenhuma.
export async function listActiveQueueOptions(): Promise<{ id: string; name: string }[]> {
  return db
    .select({ id: queues.id, name: queues.name })
    .from(queues)
    .where(isNull(queues.archivedAt))
    .orderBy(asc(queues.position), asc(queues.createdAt), asc(queues.id));
}

export async function isQueueActive(queueId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: queues.id })
    .from(queues)
    .where(and(eq(queues.id, queueId), isNull(queues.archivedAt)))
    .limit(1);
  return Boolean(row);
}
