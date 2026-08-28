import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectorGroups } from "../../../database/schema";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export async function findDefinitionById(id: string): Promise<MetricDefinitionRecord | null> {
  const [row] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.id, id)).limit(1);
  return (row as MetricDefinitionRecord) ?? null;
}

export async function groupBelongsToSector(groupId: string, sectorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: sectorGroups.id })
    .from(sectorGroups)
    .where(and(eq(sectorGroups.id, groupId), eq(sectorGroups.sectorId, sectorId)))
    .limit(1);
  return Boolean(row);
}

export async function updateMetricDefinitionRow(
  id: string,
  patch: { label: string; description: string | null; groupId: string | null; unit: string; direction: string },
): Promise<MetricDefinitionRecord> {
  const [row] = await db
    .update(metricDefinitions)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(metricDefinitions.id, id))
    .returning();
  return row as MetricDefinitionRecord;
}
