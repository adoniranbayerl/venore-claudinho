import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions } from "../../../database/schema";
import type { MetricDefinitionRecord } from "../../../contracts/types";

export async function findDefinitionById(id: string): Promise<MetricDefinitionRecord | null> {
  const [row] = await db.select().from(metricDefinitions).where(eq(metricDefinitions.id, id)).limit(1);
  return (row as MetricDefinitionRecord) ?? null;
}

export async function setDefinitionArchivedAt(id: string, archivedAt: Date | null): Promise<MetricDefinitionRecord> {
  const [row] = await db
    .update(metricDefinitions)
    .set({ archivedAt, updatedAt: new Date() })
    .where(eq(metricDefinitions.id, id))
    .returning();
  return row as MetricDefinitionRecord;
}
