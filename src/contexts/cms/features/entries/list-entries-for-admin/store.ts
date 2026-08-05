import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries, entryContentTypes } from "../../../database/schema";
import { toEntryRecords } from "../../../database/entry-content-types";
import type { EntryRecord, EntryStatus } from "../../../contracts/types";

export async function findAllEntries(filters: {
  contentTypeId?: string;
  categoryId?: string;
  status?: EntryStatus;
}): Promise<EntryRecord[]> {
  // Sempre exclui entries de outro context/plugin (internalOwner não-null, ex: seções de aula do
  // Academy via page builder — pedido desta sessão) — nunca opcional, /admin/cms/entries não deve
  // listar essas linhas em hipótese nenhuma (ver comentário em EntryRecord.internalOwner).
  const conditions = [isNull(entries.internalOwner)];
  if (filters.contentTypeId) {
    const contentTypeId = filters.contentTypeId;
    conditions.push(
      inArray(
        entries.id,
        db.select({ id: entryContentTypes.entryId }).from(entryContentTypes).where(eq(entryContentTypes.contentTypeId, contentTypeId)),
      ),
    );
  }
  if (filters.categoryId) {
    conditions.push(eq(entries.categoryId, filters.categoryId));
  }
  if (filters.status) {
    conditions.push(eq(entries.status, filters.status));
  }

  const rows = await db
    .select()
    .from(entries)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return toEntryRecords(rows);
}
