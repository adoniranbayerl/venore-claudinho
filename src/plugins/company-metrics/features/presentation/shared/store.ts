import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { tvBoards, tvScreens } from "../../../database/schema";
import type { TvBoardRecord, TvScreenRecord } from "../../../contracts/types";

export async function findAllBoards(): Promise<TvBoardRecord[]> {
  const rows = await db.select().from(tvBoards).orderBy(asc(tvBoards.createdAt));
  return rows as TvBoardRecord[];
}

export async function findBoardById(id: string): Promise<TvBoardRecord | null> {
  const [row] = await db.select().from(tvBoards).where(eq(tvBoards.id, id)).limit(1);
  return (row as TvBoardRecord) ?? null;
}

export async function findBoardByToken(token: string): Promise<TvBoardRecord | null> {
  const [row] = await db.select().from(tvBoards).where(eq(tvBoards.token, token)).limit(1);
  return (row as TvBoardRecord) ?? null;
}

export async function findScreensForBoards(boardIds: string[]): Promise<TvScreenRecord[]> {
  if (boardIds.length === 0) return [];
  const rows = await db
    .select()
    .from(tvScreens)
    .where(inArray(tvScreens.boardId, boardIds))
    .orderBy(asc(tvScreens.boardId), asc(tvScreens.position));
  return rows as TvScreenRecord[];
}
