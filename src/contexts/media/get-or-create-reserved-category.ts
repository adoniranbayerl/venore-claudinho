import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { categories } from "./database/schema";
import type { MediaCategory } from "./contracts/types";

// Categoria "de sistema" (Fase 4/M1 — docs/implementation-roadmap.md): auto-criada na primeira
// vez que for necessária, idempotente por `key`. Único caso concreto hoje é "avatars"
// (upload-avatar-media-asset atribui automaticamente) — não é uma categoria que o admin cria
// manualmente, mas convive na mesma tabela que as categorias manuais (mesmo modelo, sem
// distinção de "reservada" persistida — a reserva é só o fato de nenhuma UI deixar apagá-la
// por engano importar, e mesmo que apague, o próximo upload de avatar recria).
export async function getOrCreateReservedCategory(key: string, name: string): Promise<MediaCategory> {
  const [existing] = await db.select().from(categories).where(eq(categories.key, key)).limit(1);
  if (existing) return existing;

  const [inserted] = await db
    .insert(categories)
    .values({ key, name })
    .onConflictDoNothing({ target: categories.key })
    .returning();

  if (inserted) return inserted;

  // Corrida: outra chamada concorrente criou entre o select e o insert.
  const [raced] = await db.select().from(categories).where(eq(categories.key, key)).limit(1);
  if (!raced) {
    throw new Error(`Não foi possível criar ou encontrar a categoria reservada "${key}".`);
  }
  return raced;
}
