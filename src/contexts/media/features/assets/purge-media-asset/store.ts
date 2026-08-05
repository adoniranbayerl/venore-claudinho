import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

// Só enxerga asset já soft-deletado (blob-spec seção 7) — purgeMediaAsset nunca deve conseguir
// "pular" o soft delete e apagar de verdade um asset ainda ativo, mesmo que quem chame erre o id.
export async function findSoftDeletedAssetById(id: string): Promise<MediaAsset | null> {
  const [row] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.id, id), isNotNull(assets.deletedAt)))
    .limit(1);
  return (row as MediaAsset) ?? null;
}

export async function hardDeleteAssetById(id: string): Promise<void> {
  await db.delete(assets).where(eq(assets.id, id));
}
