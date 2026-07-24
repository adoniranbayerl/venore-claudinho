import { sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { settings } from "../../database/schema";
import type { SettingRecord } from "../../contracts/types";

export async function upsertSetting(key: string, value: unknown): Promise<SettingRecord> {
  const [row] = await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: sql`now()` },
    })
    .returning({ key: settings.key, value: settings.value, updatedAt: settings.updatedAt });

  return row;
}
