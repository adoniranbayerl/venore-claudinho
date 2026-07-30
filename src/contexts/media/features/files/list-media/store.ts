import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";

export async function findAllMedia(scope: MediaActorScope, categoryId?: string): Promise<MediaRecord[]> {
  const visibilityFilter = scope.isMediaAdmin
    ? undefined
    : or(eq(files.visibility, "public"), eq(files.uploadedBy, scope.actorId));

  const filter = categoryId ? and(visibilityFilter, eq(files.categoryId, categoryId)) : visibilityFilter;

  const rows = await db.select().from(files).where(filter).orderBy(desc(files.createdAt));
  return rows as MediaRecord[];
}
