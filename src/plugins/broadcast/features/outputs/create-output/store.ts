import { db } from "@/infrastructure/database/client";
import { broadcastOutputs } from "../../../database/schema";
import { slugifyOutputName } from "../../../shared/output-token";
import type { BroadcastOutputRecord } from "../../../contracts/types";

const MAX_SLUG_ATTEMPTS = 50;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

// token é o slug do nome ("TV da recepção" -> "tv-da-recepcao"), não mais um UUID — é a parte que
// o operador digita na URL da TV, precisa ser curto e fácil de digitar num controle remoto (ver
// shared/output-token.ts). Colisão (duas saídas com o mesmo nome/slug) resolve tentando um sufixo
// numérico crescente até o índice único de `token` aceitar.
export async function insertOutput(input: { name: string }): Promise<BroadcastOutputRecord> {
  const base = slugifyOutputName(input.name);
  let token = base;
  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      const [row] = await db.insert(broadcastOutputs).values({ ...input, token }).returning();
      return row as BroadcastOutputRecord;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === MAX_SLUG_ATTEMPTS) throw error;
      token = `${base}-${attempt + 1}`;
    }
  }
  throw new Error("unreachable");
}
