import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";

export async function findAssetByPathname(pathname: string): Promise<MediaAsset | null> {
  const [row] = await db.select().from(assets).where(eq(assets.pathname, pathname)).limit(1);
  return (row as MediaAsset) ?? null;
}

export async function findActiveAssetByChecksum(checksum: string): Promise<MediaAsset | null> {
  const [row] = await db
    .select()
    .from(assets)
    .where(and(eq(assets.checksum, checksum), isNull(assets.deletedAt)))
    .limit(1);
  return (row as MediaAsset) ?? null;
}

// Idempotente por `pathname` (índice único media_assets_pathname_idx): se a linha já existe,
// o insert é ignorado silenciosamente e nada novo é criado — registrar duas vezes o mesmo blob
// nunca cria dois registros.
export async function insertAssetIfAbsent(input: {
  pathname: string;
  url: string;
  contentType: string;
  size: number;
  checksum: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  uploadedBy: string;
}): Promise<MediaAsset | null> {
  const [row] = await db.insert(assets).values(input).onConflictDoNothing({ target: assets.pathname }).returning();
  return (row as MediaAsset) ?? null;
}
