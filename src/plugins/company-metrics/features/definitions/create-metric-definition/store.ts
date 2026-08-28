import { and, eq, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectorGroups, sectors } from "../../../database/schema";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export async function sectorExists(sectorId: string): Promise<boolean> {
  const [row] = await db.select({ id: sectors.id }).from(sectors).where(eq(sectors.id, sectorId)).limit(1);
  return Boolean(row);
}

// Grupo precisa existir E pertencer ao mesmo setor da definição.
export async function groupBelongsToSector(groupId: string, sectorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: sectorGroups.id })
    .from(sectorGroups)
    .where(and(eq(sectorGroups.id, groupId), eq(sectorGroups.sectorId, sectorId)))
    .limit(1);
  return Boolean(row);
}

export async function definitionKeyExists(sectorId: string, key: string): Promise<boolean> {
  const [row] = await db
    .select({ id: metricDefinitions.id })
    .from(metricDefinitions)
    .where(and(eq(metricDefinitions.sectorId, sectorId), eq(metricDefinitions.key, key)))
    .limit(1);
  return Boolean(row);
}

export async function nextDefinitionPosition(sectorId: string): Promise<number> {
  const [row] = await db
    .select({ maxPosition: max(metricDefinitions.position) })
    .from(metricDefinitions)
    .where(eq(metricDefinitions.sectorId, sectorId));
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertMetricDefinition(input: {
  sectorId: string;
  groupId: string | null;
  key: string;
  label: string;
  description: string | null;
  unit: string;
  aggregation: string;
  granularity: string;
  direction: string;
  position: number;
}): Promise<MetricDefinitionRecord> {
  const [row] = await db.insert(metricDefinitions).values(input).returning();
  return row as MetricDefinitionRecord;
}
