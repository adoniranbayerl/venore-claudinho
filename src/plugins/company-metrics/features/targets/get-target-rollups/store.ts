import { and, asc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues, targetInputs, targets } from "../../../database/schema";
import type { MetricDefinitionRecord, MetricValueRecord, TargetInputRecord, TargetRecord } from "../../../contracts/types";

export async function findSectorTargets(sectorId: string): Promise<TargetRecord[]> {
  const rows = await db
    .select()
    .from(targets)
    .where(and(eq(targets.sectorId, sectorId), isNull(targets.archivedAt)))
    .orderBy(asc(targets.position), asc(targets.createdAt));
  return rows as TargetRecord[];
}

export async function findInputsForTargets(targetIds: string[]): Promise<TargetInputRecord[]> {
  if (targetIds.length === 0) return [];
  const rows = await db
    .select()
    .from(targetInputs)
    .where(inArray(targetInputs.targetId, targetIds))
    .orderBy(asc(targetInputs.targetId), asc(targetInputs.position));
  return rows as TargetInputRecord[];
}

export async function findDefinitionsByIds(ids: string[]): Promise<MetricDefinitionRecord[]> {
  if (ids.length === 0) return [];
  const rows = await db.select().from(metricDefinitions).where(inArray(metricDefinitions.id, ids));
  return rows as MetricDefinitionRecord[];
}

export async function findValuesForDefinitionsInRange(
  definitionIds: string[],
  from: string,
  to: string,
): Promise<MetricValueRecord[]> {
  if (definitionIds.length === 0) return [];
  const rows = await db
    .select()
    .from(metricValues)
    .where(
      and(
        inArray(metricValues.definitionId, definitionIds),
        gte(metricValues.periodStart, from),
        lte(metricValues.periodStart, to),
      ),
    )
    .orderBy(asc(metricValues.definitionId), asc(metricValues.periodStart));
  return rows as MetricValueRecord[];
}
