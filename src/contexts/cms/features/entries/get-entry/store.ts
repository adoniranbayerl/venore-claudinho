import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { entries } from "../../../database/schema";
import { toEntryRecord } from "../../../database/entry-content-types";
import type { EntryRecord } from "../../../contracts/types";

// Usada pela tela de admin (/admin/cms/entries/[id]) pra abrir uma entry pra edição
// independente de status — draft também precisa ser editável. Leitura pública filtrada por
// status vive em get-published-entry-by-slug, não aqui.
export async function findEntryById(id: string): Promise<EntryRecord | null> {
  const [row] = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return row ? await toEntryRecord(row) : null;
}
