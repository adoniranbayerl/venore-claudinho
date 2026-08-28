import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { targets } from "../../../database/schema";
import type { TargetRecord } from "../../../contracts/types";

export async function findTargetById(id: string): Promise<TargetRecord | null> {
  const [row] = await db.select().from(targets).where(eq(targets.id, id)).limit(1);
  return (row as TargetRecord) ?? null;
}

// target_inputs some em cascata (FK onDelete cascade).
export async function deleteTargetById(id: string): Promise<void> {
  await db.delete(targets).where(eq(targets.id, id));
}
