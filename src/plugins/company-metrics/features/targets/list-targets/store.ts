import { and, asc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { targetInputs, targets } from "../../../database/schema";
import type { TargetInputRecord, TargetRecord } from "../../../contracts/types";

export async function findTargets(filter: {
  sectorId?: string;
  sectorIds?: string[];
  includeArchived: boolean;
}): Promise<TargetRecord[]> {
  const conditions: SQL[] = [];
  if (!filter.includeArchived) conditions.push(isNull(targets.archivedAt));
  if (filter.sectorId) conditions.push(eq(targets.sectorId, filter.sectorId));
  else if (filter.sectorIds) {
    if (filter.sectorIds.length === 0) return [];
    conditions.push(inArray(targets.sectorId, filter.sectorIds));
  }

  const rows = await db
    .select()
    .from(targets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(targets.sectorId), asc(targets.position), asc(targets.createdAt));
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
