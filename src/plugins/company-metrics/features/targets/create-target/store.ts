import { and, eq, inArray, max } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectorGroups, sectors, targetInputs, targets } from "../../../database/schema";
import type { TargetRecord } from "../../../contracts/types";
import type { TargetInputDraft } from "../shared/target-input";

export async function sectorExists(sectorId: string): Promise<boolean> {
  const [row] = await db.select({ id: sectors.id }).from(sectors).where(eq(sectors.id, sectorId)).limit(1);
  return Boolean(row);
}

export async function groupBelongsToSector(groupId: string, sectorId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: sectorGroups.id })
    .from(sectorGroups)
    .where(and(eq(sectorGroups.id, groupId), eq(sectorGroups.sectorId, sectorId)))
    .limit(1);
  return Boolean(row);
}

// Ids de definição (dentre os pedidos) que de fato pertencem ao setor.
export async function definitionIdsInSector(sectorId: string, definitionIds: string[]): Promise<Set<string>> {
  if (definitionIds.length === 0) return new Set();
  const rows = await db
    .select({ id: metricDefinitions.id })
    .from(metricDefinitions)
    .where(and(eq(metricDefinitions.sectorId, sectorId), inArray(metricDefinitions.id, definitionIds)));
  return new Set(rows.map((row) => row.id));
}

export async function nextTargetPosition(sectorId: string): Promise<number> {
  const [row] = await db.select({ maxPosition: max(targets.position) }).from(targets).where(eq(targets.sectorId, sectorId));
  return (row?.maxPosition ?? 0) + 1;
}

export async function insertTargetWithInputs(
  target: {
    sectorId: string;
    groupId: string | null;
    label: string;
    description: string | null;
    targetValue: number;
    periodStart: string;
    periodEnd: string;
    onTrackThreshold: number;
    position: number;
  },
  inputs: TargetInputDraft[],
): Promise<TargetRecord> {
  return db.transaction(async (tx) => {
    const [row] = await tx.insert(targets).values(target).returning();
    if (inputs.length > 0) {
      await tx.insert(targetInputs).values(
        inputs.map((input, index) => ({
          targetId: (row as TargetRecord).id,
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
