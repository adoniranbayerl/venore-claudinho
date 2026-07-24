import { db } from "@/infrastructure/database/client";
import { contentTypes } from "../../../database/schema";
import type { ContentTypeRecord } from "../../../contracts/types";

export async function findAllContentTypes(): Promise<ContentTypeRecord[]> {
  return db.select().from(contentTypes);
}
