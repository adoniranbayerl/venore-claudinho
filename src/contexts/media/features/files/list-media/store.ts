import { desc, eq, or } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";

export async function findAllMedia(scope: MediaActorScope): Promise<MediaRecord[]> {
  const visibilityFilter = scope.isMediaAdmin
    ? undefined
    : or(eq(files.visibility, "public"), eq(files.uploadedBy, scope.actorId));

  const rows = await db.select().from(files).where(visibilityFilter).orderBy(desc(files.createdAt));
  return rows as MediaRecord[];
}
