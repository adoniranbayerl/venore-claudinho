import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { contentTypes } from "../../../database/schema";
import type { ContentTypeRecord } from "../../../contracts/types";

export async function findContentTypeByKey(key: string): Promise<ContentTypeRecord | null> {
  const [row] = await db.select().from(contentTypes).where(eq(contentTypes.key, key)).limit(1);
  return row ?? null;
}

export async function insertContentType(input: {
  key: string;
  name: string;
  description?: string;
}): Promise<ContentTypeRecord> {
  const [row] = await db
    .insert(contentTypes)
    .values({ key: input.key, name: input.name, description: input.description ?? null })
    .returning();

  return row;
}
