import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { contentTypes } from "./database/schema";
import type { ContentTypeRecord } from "./contracts/types";

// Tag "de sistema", mesmo raciocínio de contexts/media/get-or-create-reserved-category.ts:
// auto-criada na primeira vez que for necessária, idempotente por `key`, sem passar pelo handler
// (que exigiria cms.content-types.manage do ator — pedido desta sessão é academy.courses.manage
// bastar pra criar uma seção de texto, não empilhar mais uma permission). Único caso concreto
// hoje é "academy" (create-lesson-section-content, ao criar a entry oculta por trás de uma
// seção de texto) — convive na mesma tabela que tags manuais, sem distinção "reservada"
// persistida (mesma decisão de design da categoria de mídia).
export async function getOrCreateReservedContentType(key: string, name: string): Promise<ContentTypeRecord> {
  const [existing] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  if (existing) return existing;

  const [inserted] = await db
    .insert(contentTypes)
    .values({ key, name })
    .onConflictDoNothing({ target: contentTypes.key })
    .returning();

  if (inserted) return inserted;

  const [raced] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  if (!raced) {
    throw new Error(`Não foi possível criar ou encontrar a tag reservada "${key}".`);
  }
  return raced;
}
