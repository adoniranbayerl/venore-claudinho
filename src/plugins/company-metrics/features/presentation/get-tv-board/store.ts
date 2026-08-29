import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, metricValues, sectorGroups, sectors, targets } from "../../../database/schema";
import type {
  MetricDefinitionRecord,
  MetricUnit,
  SectorGroupRecord,
  SectorRecord,
  TargetRecord,
} from "../../../contracts/types";

export async function findTargetById(id: string): Promise<TargetRecord | null> {
  const [row] = await db.select().from(targets).where(eq(targets.id, id)).limit(1);
  return (row as TargetRecord) ?? null;
}

export async function findSectorById(id: string): Promise<SectorRecord | null> {
  const [row] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1);
  return (row as SectorRecord) ?? null;
}

export async function findDefinitionUnit(id: string): Promise<MetricUnit | null> {
  const [row] = await db.select({ unit: metricDefinitions.unit }).from(metricDefinitions).where(eq(metricDefinitions.id, id)).limit(1);
  return (row?.unit as MetricUnit) ?? null;
}

export async function findSectorDefinitions(sectorId: string): Promise<MetricDefinitionRecord[]> {
  const rows = await db.select().from(metricDefinitions).where(eq(metricDefinitions.sectorId, sectorId));
  return rows as MetricDefinitionRecord[];
}

export async function findSectorGroups(sectorId: string): Promise<SectorGroupRecord[]> {
  const rows = await db
    .select()
    .from(sectorGroups)
    .where(eq(sectorGroups.sectorId, sectorId))
    .orderBy(asc(sectorGroups.position), asc(sectorGroups.createdAt));
  return rows as SectorGroupRecord[];
}

export async function findDefinitionById(id: string): Promise<MetricDefinitionRecord | null> {
  const [row] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.id, id)).limit(1);
  return (row as MetricDefinitionRecord) ?? null;
}

// Últimos N valores de uma definição (para o sparkline da tela de destaque), em ordem crescente.
export async function findRecentValues(definitionId: string, limit: number): Promise<{ periodStart: string; value: number }[]> {
  const rows = await db
    .select({ periodStart: metricValues.periodStart, value: metricValues.value })
    .from(metricValues)
    .where(eq(metricValues.definitionId, definitionId))
    .orderBy(desc(metricValues.periodStart))
    .limit(limit);
  return rows.reverse();
}
