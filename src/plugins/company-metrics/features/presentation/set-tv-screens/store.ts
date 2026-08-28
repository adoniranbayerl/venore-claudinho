import { eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { sectors, targets, tvScreens } from "../../../database/schema";
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

export async function replaceScreens(boardId: string, screens: TvScreenDraft[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(tvScreens).where(eq(tvScreens.boardId, boardId));
    if (screens.length > 0) {
      await tx.insert(tvScreens).values(
        screens.map((screen, index) => ({
          boardId,
          kind: screen.kind,
          sectorId: screen.kind === "sector_kpis" ? screen.sectorId ?? null : null,
          targetId: screen.kind === "target_board" ? screen.targetId ?? null : null,
          dwellSeconds: screen.dwellSeconds,
          position: index,
        })),
      );
    }
  });
}
