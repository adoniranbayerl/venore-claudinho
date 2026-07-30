import { and, eq, or } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord } from "../../../contracts/types";
import type { MediaActorScope } from "../../../resolve-media-actor-scope";

export async function findMediaById(id: string, scope: MediaActorScope): Promise<MediaRecord | null> {
  const filter = scope.isMediaAdmin
    ? eq(files.id, id)
    : and(eq(files.id, id), or(eq(files.visibility, "public"), eq(files.uploadedBy, scope.actorId)));

  const [row] = await db.select().from(files).where(filter).limit(1);
  return (row as MediaRecord) ?? null;
}
