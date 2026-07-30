import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { extensionState } from "../../database/schema";
import type { ExtensionKind } from "../../contracts/types";

export async function findExtensionState(kind: ExtensionKind, key: string): Promise<{ enabled: boolean } | null> {
  const [row] = await db
    .select({ enabled: extensionState.enabled })
    .from(extensionState)
    .where(and(eq(extensionState.kind, kind), eq(extensionState.key, key)))
    .limit(1);

  return row ?? null;
}
