import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { settings } from "../../database/schema";
import type { SettingRecord } from "../../contracts/types";

export async function findSettingByKey(key: string): Promise<SettingRecord | null> {
  const [row] = await db
    .select({ key: settings.key, value: settings.value, updatedAt: settings.updatedAt })
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  return row ?? null;
}
