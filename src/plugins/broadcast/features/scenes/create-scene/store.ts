import { desc } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { broadcastScenes } from "../../../database/schema";
import type { BroadcastSceneRecord } from "../../../contracts/types";

export async function findMaxSceneOrder(): Promise<number> {
  const [row] = await db.select({ order: broadcastScenes.order }).from(broadcastScenes).orderBy(desc(broadcastScenes.order)).limit(1);
  return row?.order ?? -1;
}

export async function insertScene(input: { key: string; name: string; order: number }): Promise<BroadcastSceneRecord> {
  const [row] = await db.insert(broadcastScenes).values(input).returning();
  return row as BroadcastSceneRecord;
}
