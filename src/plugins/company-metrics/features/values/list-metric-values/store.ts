import { and, asc, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues } from "../../../database/schema";
import type { MetricValueRecord } from "../../../contracts/types";

export async function findMetricValues(query: {
  sectorId?: string;
  definitionIds?: string[];
  from: string;
  to: string;
}): Promise<MetricValueRecord[]> {
  const conditions: SQL[] = [gte(metricValues.periodStart, query.from), lte(metricValues.periodStart, query.to)];

  if (query.definitionIds) {
    if (query.definitionIds.length === 0) return [];
    conditions.push(inArray(metricValues.definitionId, query.definitionIds));
  }

  // Filtro por setor exige juntar com a definição.
  if (query.sectorId) {
    const rows = await db
      .select({
        id: metricValues.id,
        definitionId: metricValues.definitionId,
        periodStart: metricValues.periodStart,
        value: metricValues.value,
        note: metricValues.note,
        enteredByUserId: metricValues.enteredByUserId,
        enteredAt: metricValues.enteredAt,
        updatedAt: metricValues.updatedAt,
      })
      .from(metricValues)
      .innerJoin(metricDefinitions, eq(metricValues.definitionId, metricDefinitions.id))
      .where(and(eq(metricDefinitions.sectorId, query.sectorId), ...conditions))
      .orderBy(asc(metricValues.definitionId), asc(metricValues.periodStart));
    return rows as MetricValueRecord[];
  }

  const rows = await db
    .select()
    .from(metricValues)
    .where(and(...conditions))
    .orderBy(asc(metricValues.definitionId), asc(metricValues.periodStart));
  return rows as MetricValueRecord[];
}
