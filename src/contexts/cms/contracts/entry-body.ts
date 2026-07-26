import type { Composition } from "./block";
import { compositionSchema } from "./block";

// data é jsonb livre por content type (sem fieldsSchema nesta v1 — ver database/schema/index.ts).
// O form simples de entry guarda o corpo em texto livre como data.body; esta função é o único
// lugar que sabe extrair isso, reaproveitada pela tela de admin e pela renderização pública.
export function getEntryBody(data: unknown): string {
  if (data && typeof data === "object" && "body" in data && typeof (data as { body: unknown }).body === "string") {
    return (data as { body: string }).body;
  }
  return "";
}

// Legado (getEntryBody) convive com o novo modelo de blocos: entries antigas não têm
// data.blocks, então isso retorna null em vez de composição vazia, permitindo o chamador
// distinguir "não migrada" de "composição vazia".
export function getEntryComposition(data: unknown): Composition | null {
  if (!data || typeof data !== "object" || !("blocks" in data)) {
    return null;
  }

  const parsed = compositionSchema.safeParse((data as { blocks: unknown }).blocks);
  return parsed.success ? parsed.data : null;
}
