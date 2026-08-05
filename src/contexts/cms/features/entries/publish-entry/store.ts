import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { toEntryRecord } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

export async function findEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return row ? await toEntryRecord(row) : null;
}

// Publicar limpa o agendamento de publicação (scheduledPublishAt) — a entry já chegou onde ele
// apontava. scheduledArchiveAt NÃO é tocado aqui de propósito: agendar publicação e agendar
// arquivamento são independentes (Fase 2/C5) — publicar manualmente uma entry "scheduled" não
// deve cancelar um arquivamento futuro já configurado.
export async function markEntryPublished(id: string): Promise<EntryRecord> {
  const [row] = await db
    .update(entries)
    .set({ status: "published", scheduledPublishAt: null, publishedAt: sql`now()`, updatedAt: sql`now()` })
    .where(eq(entries.id, id))
    .returning();

  return toEntryRecord(row);
}
