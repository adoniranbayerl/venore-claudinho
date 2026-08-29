import { db } from "@/infrastructure/database/client";
import { metricValues } from "../../database/schema";

// Insert em lote de valores — só pro seed (evita centenas de round-trips por
// upsertMetricValueForPeriod). Acesso direto ao db fora de um store por feature: exceção
// deliberada, mesmo racional de seeds/example.ts chamar service.ts direto e de
// shared/scoped-authorization/store.ts.
export async function bulkInsertMetricValues(
  rows: { definitionId: string; periodStart: string; value: number; enteredByUserId: string }[],
): Promise<void> {
  if (rows.length === 0) return;
  // Chunk pra não estourar limite de parâmetros do Postgres.
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(metricValues).values(rows.slice(i, i + CHUNK)).onConflictDoNothing();
  }
}
