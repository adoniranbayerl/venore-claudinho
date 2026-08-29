import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { metricDefinitions, sectors, targets, tvScreens } from "../../../database/schema";
import type { TvScreenDraft } from "./types";

export async function existingSectorIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const rows = await db.select({ id: sectors.id }).from(sectors).where(inArray(sectors.id, ids));
  return new Set(rows.map((row) => row.id));
}

export async function existingTargetIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const rows = await db.select({ id: targets.id }).from(targets).where(inArray(targets.id, ids));
  return new Set(rows.map((row) => row.id));
}

export async function existingDefinitionIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const rows = await db.select({ id: metricDefinitions.id }).from(metricDefinitions).where(inArray(metricDefinitions.id, ids));
  return new Set(rows.map((row) => row.id));
}

const SECTOR_KINDS = new Set(["sector_kpis", "sector_targets", "group_summary"]);

export async function replaceScreens(boardId: string, screens: TvScreenDraft[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(tvScreens).where(eq(tvScreens.boardId, boardId));
    if (screens.length > 0) {
      await tx.insert(tvScreens).values(
        screens.map((screen, index) => ({
          boardId,
          kind: screen.kind,
          sectorId: SECTOR_KINDS.has(screen.kind) ? screen.sectorId ?? null : null,
          targetId: screen.kind === "target_board" ? screen.targetId ?? null : null,
          definitionId: screen.kind === "metric_spotlight" ? screen.definitionId ?? null : null,
          dwellSeconds: screen.dwellSeconds,
          position: index,
        })),
      );
    }
  });
}
