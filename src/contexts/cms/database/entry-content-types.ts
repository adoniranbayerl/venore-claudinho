import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries, entryContentTypes } from "./schema";
import type { EntryRecord } from "../contracts/types";

// Tipo do `tx` de db.transaction((tx) => ...), derivado em vez de escrito à mão — evita
// hardcodar os generics do NodePgTransaction, que mudariam se o client trocar de driver.
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Acesso de baixo nível ao junction entry_content_types (tag N:N — Fase 2/#2), compartilhado por
// vários use cases de entries (create-entry, update-entry, list-entries, list-entries-for-admin,
// get-entry, get-published-entry-by-slug): nenhum deles é o "dono" exclusivo dessa tabela, então
// mora aqui em vez do store.ts de um único use case (docs AGENTS.md §1 — store.ts é único ponto
// de acesso a dado DO USE CASE, não impede um helper de tabela compartilhado entre vários).

export async function findContentTypeIdsForEntry(entryId: string): Promise<string[]> {
  const rows = await db
    .select({ contentTypeId: entryContentTypes.contentTypeId })
    .from(entryContentTypes)
    .where(eq(entryContentTypes.entryId, entryId));

  return rows.map((row) => row.contentTypeId);
}

// Batch — evita N+1 quando list-entries/list-entries-for-admin resolve tags de várias entries de
// uma vez (mesmo cuidado documentado em resolve-breadcrumbs.ts pra segmentos dinâmicos).
export async function findContentTypeIdsForEntries(entryIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (entryIds.length === 0) return map;

  const rows = await db
    .select({ entryId: entryContentTypes.entryId, contentTypeId: entryContentTypes.contentTypeId })
    .from(entryContentTypes)
    .where(inArray(entryContentTypes.entryId, entryIds));

  for (const row of rows) {
    const list = map.get(row.entryId);
    if (list) {
      list.push(row.contentTypeId);
    } else {
      map.set(row.entryId, [row.contentTypeId]);
    }
  }

  return map;
}

export async function findEntryIdsByContentTypeId(contentTypeId: string): Promise<string[]> {
  const rows = await db
    .select({ entryId: entryContentTypes.entryId })
    .from(entryContentTypes)
    .where(eq(entryContentTypes.contentTypeId, contentTypeId));

  return rows.map((row) => row.entryId);
}

// Substitui o conjunto inteiro (delete + insert) — sempre dentro de uma transação já aberta pelo
// chamador (create-entry/update-entry), nunca abre a própria, pra fazer parte do mesmo commit/
// rollback do resto da escrita da entry.
export async function replaceEntryContentTypes(
  tx: Transaction,
  entryId: string,
  contentTypeIds: string[],
): Promise<void> {
  await tx.delete(entryContentTypes).where(eq(entryContentTypes.entryId, entryId));
  if (contentTypeIds.length > 0) {
    await tx.insert(entryContentTypes).values(contentTypeIds.map((contentTypeId) => ({ entryId, contentTypeId })));
  }
}

// Linha crua de `entries` (sem contentTypeIds, que não é mais coluna da própria tabela desde a
// migração pra N:N). Todo store.ts de entries que faz um `db.select().from(entries)` precisa
// passar o resultado por toEntryRecord/toEntryRecords antes de devolver um EntryRecord de
// verdade — só fazer `row as EntryRecord` direto deixaria contentTypeIds undefined em runtime
// apesar do cast enganar o TypeScript.
type RawEntryRow = typeof entries.$inferSelect;

export async function toEntryRecord(row: RawEntryRow): Promise<EntryRecord> {
  const contentTypeIds = await findContentTypeIdsForEntry(row.id);
  return { ...row, contentTypeIds } as EntryRecord;
}

export async function toEntryRecords(rows: RawEntryRow[]): Promise<EntryRecord[]> {
  const contentTypeIdsByEntry = await findContentTypeIdsForEntries(rows.map((row) => row.id));
  return rows.map((row) => ({ ...row, contentTypeIds: contentTypeIdsByEntry.get(row.id) ?? [] }) as EntryRecord);
}
