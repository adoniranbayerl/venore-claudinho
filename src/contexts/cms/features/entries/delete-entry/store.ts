import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { toEntryRecord } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

export async function findEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return row ? await toEntryRecord(row) : null;
}

// entry_content_types cai sozinho (onDelete: "cascade"). menu_items.contentId não tem FK de
// propósito (docs/venore-docks.md — "conteúdo apagado não derruba a montagem do menu"); um item
// de menu apontando pra esta entry vira pendência silenciosa no admin, some do público — mesmo
// comportamento já aceito pra entries não publicadas/despublicadas.
export async function deleteEntryById(id: string): Promise<void> {
  await db.delete(entries).where(eq(entries.id, id));
}
