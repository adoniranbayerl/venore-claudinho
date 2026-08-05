import { and, desc, isNotNull, lt } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

// Só a lixeira (tela de purge, atrás de media.purge) e o sweep de autopurge
// (platform/media-lifecycle/sweep-soft-deleted-media.ts) leem isto — a grade normal e os pickers
// filtram `deletedAt IS NULL` (list-media-assets/store.ts), nunca o contrário.
export async function findAllSoftDeletedAssets(olderThan?: Date): Promise<MediaAsset[]> {
  const filter = olderThan ? and(isNotNull(assets.deletedAt), lt(assets.deletedAt, olderThan)) : isNotNull(assets.deletedAt);
  const rows = await db.select().from(assets).where(filter).orderBy(desc(assets.deletedAt));
  return rows as MediaAsset[];
}
