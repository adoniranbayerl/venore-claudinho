import { sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { extensionState } from "../../database/schema";
import type { ExtensionKind, ExtensionStateRecord } from "../../contracts/types";

export async function upsertExtensionState(
  kind: ExtensionKind,
  key: string,
  enabled: boolean,
  updatedByUserId: string,
): Promise<ExtensionStateRecord> {
  const [row] = await db
    .insert(extensionState)
    .values({ kind, key, enabled, updatedByUserId })
    .onConflictDoUpdate({
      target: [extensionState.kind, extensionState.key],
      set: { enabled, updatedByUserId, updatedAt: sql`now()` },
    })
    .returning();

  return row;
}
