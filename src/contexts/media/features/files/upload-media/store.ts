import { db } from "@/infrastructure/database/client";
import { files } from "../../../database/schema";
import type { MediaRecord, MediaVisibility } from "../../../contracts/types";

export async function insertMediaFile(input: {
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  visibility: MediaVisibility;
}): Promise<MediaRecord> {
  const [row] = await db.insert(files).values(input).returning();
  return row as MediaRecord;
}
