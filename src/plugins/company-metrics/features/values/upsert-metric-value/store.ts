import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues } from "../../../database/schema";
import type { MetricDefinitionRecord, MetricValueRecord } from "../../../contracts/types";

export async function findDefinitionById(id: string): Promise<MetricDefinitionRecord | null> {
  const [row] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.id, id)).limit(1);
  return (row as MetricDefinitionRecord) ?? null;
}

// Upsert por (definition_id, period_start) — o lançamento sobrescreve o valor do período.
export async function upsertMetricValue(input: {
  definitionId: string;
  periodStart: string;
  value: number;
  note: string | null;
  enteredByUserId: string;
}): Promise<MetricValueRecord> {
  const [row] = await db
    .insert(metricValues)
    .values({
      definitionId: input.definitionId,
      periodStart: input.periodStart,
      value: input.value,
      note: input.note,
      enteredByUserId: input.enteredByUserId,
    })
    .onConflictDoUpdate({
      target: [metricValues.definitionId, metricValues.periodStart],
      set: {
        value: input.value,
        note: input.note,
        enteredByUserId: input.enteredByUserId,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row as MetricValueRecord;
}

export async function deleteMetricValue(definitionId: string, periodStart: string): Promise<void> {
  await db
    .delete(metricValues)
    .where(and(eq(metricValues.definitionId, definitionId), eq(metricValues.periodStart, periodStart)));
}
