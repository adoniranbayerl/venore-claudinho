import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectors, targets } from "../../../database/schema";
import type { MetricUnit, SectorRecord, TargetRecord } from "../../../contracts/types";

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
