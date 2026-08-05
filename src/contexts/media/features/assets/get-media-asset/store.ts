import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { assets } from "../../../database/schema";
import type { MediaAsset } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";

export async function findAssetByIdForScope(id: string, scope: MediaActorScope): Promise<MediaAsset | null> {
  const filter = scope.isMediaAdmin
    ? and(eq(assets.id, id), isNull(assets.deletedAt))
    : and(eq(assets.id, id), isNull(assets.deletedAt), or(eq(assets.visibility, "public"), eq(assets.uploadedBy, scope.actorId)));

  const [row] = await db.select().from(assets).where(filter).limit(1);
  return (row as MediaAsset) ?? null;
}

// Sem filtro de visibilidade/dono — só chamar de dentro de um service que JÁ verificou sozinho
// que o ator atual pode ver este asset específico (ver getMediaAssetForTrustedReview).
export async function findAssetByIdUnscoped(id: string): Promise<MediaAsset | null> {
  const [row] = await db.select().from(assets).where(and(eq(assets.id, id), isNull(assets.deletedAt))).limit(1);
  return (row as MediaAsset) ?? null;
}
