import { db } from "@/infrastructure/database/client";
import { settings } from "../../database/schema";

export async function insertSettingIfMissing(key: string, value: unknown): Promise<boolean> {
  const [row] = await db.insert(settings).values({ key, value }).onConflictDoNothing({ target: settings.key }).returning({ key: settings.key });

  return row !== undefined;
}
