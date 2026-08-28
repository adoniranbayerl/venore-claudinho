import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectorGroups, targetInputs, targets } from "../../../database/schema";
import type { TargetRecord } from "../../../contracts/types";
import type { TargetInputDraft } from "../shared/target-input";

export async function findTargetById(id: string): Promise<TargetRecord | null> {
  const [row] = await db.select().from(targets).where(eq(targets.id, id)).limit(1);
  return (row as TargetRecord) ?? null;
}

export async function groupBelongsToSector(groupId: string, sectorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: sectorGroups.id })
    .from(sectorGroups)
    .where(and(eq(sectorGroups.id, groupId), eq(sectorGroups.sectorId, sectorId)))
    .limit(1);
  return Boolean(row);
}

export async function definitionIdsInSector(sectorId: string, definitionIds: string[]): Promise<Set<string>> {
  if (definitionIds.length === 0) return new Set();
  const rows = await db
    .select({ id: metricDefinitions.id })
    .from(metricDefinitions)
    .where(and(eq(metricDefinitions.sectorId, sectorId), inArray(metricDefinitions.id, definitionIds)));
  return new Set(rows.map((row) => row.id));
}

export async function updateTargetWithInputs(
  id: string,
  patch: {
    groupId: string | null;
    label: string;
    description: string | null;
    targetValue: number;
    periodStart: string;
    periodEnd: string;
    onTrackThreshold: number;
  },
  inputs: TargetInputDraft[],
): Promise<TargetRecord> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(targets)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(targets.id, id))
      .returning();
    await tx.delete(targetInputs).where(eq(targetInputs.targetId, id));
    if (inputs.length > 0) {
      await tx.insert(targetInputs).values(
        inputs.map((input, index) => ({
          targetId: id,
          definitionId: input.definitionId,
          weight: input.weight,
          classification: input.classification,
          position: index,
        })),
      );
    }
    return row as TargetRecord;
  });
}
